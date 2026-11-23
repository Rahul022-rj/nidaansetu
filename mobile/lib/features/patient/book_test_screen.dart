import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api/api_error.dart';
import '../../core/utils/ist_dates.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/patient_repo.dart';
import '../../repositories/public_repo.dart';
import 'patient_home_screen.dart';
import 'village_provider.dart';

class BookTestScreen extends ConsumerStatefulWidget {
  const BookTestScreen({super.key});

  @override
  ConsumerState<BookTestScreen> createState() => _BookTestScreenState();
}

class _BookTestScreenState extends ConsumerState<BookTestScreen> {
  int _step = 0;
  bool _loading = false;
  String? _error;

  List<JsonMap> _labs = [];
  JsonMap? _selectedLab;

  List<JsonMap> _tests = [];
  final Set<String> _selectedTestIds = {};
  String _testQuery = '';

  List<JsonMap> _family = [];
  String? _selectedFamilyId;
  final _addressCtrl = TextEditingController();
  late DateTime _selectedDate;
  String _selectedSlot = IstDates.canonicalSlots.first;
  String _paymentMode = 'cash';
  bool _consent = false;

  JsonMap? _receipt;

  @override
  void initState() {
    super.initState();
    _selectedDate = IstDates.nextSevenDays().first;
    _loadLabs();
  }

  Future<void> _loadLabs() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final village = ref.read(selectedVillageProvider);
      final villageId = (village?['_id'] ?? village?['id'])?.toString();
      final labs =
          await ref.read(publicRepoProvider).getLabs(villageId: villageId);
      if (mounted) setState(() => _labs = labs);
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _selectLab(JsonMap lab) async {
    setState(() {
      _selectedLab = lab;
      _selectedTestIds.clear();
      _loading = true;
      _error = null;
    });
    try {
      final labId = (lab['_id'] ?? lab['id']).toString();
      final res = await ref.read(publicRepoProvider).getLabTests(labId);
      final tests = asJsonMapList(res['data']);
      final labDetails = res['lab'] != null ? asJsonMap(res['lab']) : null;
      if (mounted) {
        setState(() {
          if (labDetails != null) {
            _selectedLab = <String, dynamic>{...lab, ...labDetails};
          }
          _tests = tests;
          _step = 1;
        });
      }
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _goToDetails() async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final fam = await ref.read(patientRepoProvider).getFamilyMembers();
      if (mounted) {
        setState(() {
          _family = fam;
          _step = 2;
        });
      }
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  int get _estimatedTestTotal {
    int sum = 0;
    for (final t in _tests) {
      final id = (t['_id'] ?? t['id']).toString();
      if (_selectedTestIds.contains(id)) {
        sum += (t['listingPrice'] as num?)?.toInt() ?? 0;
      }
    }
    return sum;
  }

  int get _estimatedCollectionFee {
    final fee = (_selectedLab?['collectionFee'] as num?)?.toInt() ?? 0;
    final freeAbove = (_selectedLab?['freeCollectionAbove'] as num?)?.toInt();
    if (freeAbove != null && _estimatedTestTotal >= freeAbove) return 0;
    return fee;
  }

  int get _minOrderValue => (_selectedLab?['minOrderValue'] as num?)?.toInt() ?? 0;

  Future<void> _submitBooking() async {
    if (_addressCtrl.text.trim().length < 3) {
      setState(() => _error = 'Poora pata likhein (kam se kam 3 akshar)');
      return;
    }
    if (!_consent) {
      setState(
        () => _error = 'Report share karne ki sehmati (consent) zaroori hai',
      );
      return;
    }

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final village = ref.read(selectedVillageProvider);
      final villageId = (village?['_id'] ?? village?['id'])?.toString();
      final labId = (_selectedLab!['_id'] ?? _selectedLab!['id']).toString();

      final booking = await ref.read(patientRepoProvider).createBooking(
            labId: labId,
            testIds: _selectedTestIds.toList(),
            villageId: villageId,
            familyMemberId: _selectedFamilyId,
            address: _addressCtrl.text,
            date: IstDates.toApiDate(_selectedDate),
            slot: _selectedSlot,
            paymentMode: _paymentMode,
          );

      ref.invalidate(myBookingsProvider);
      if (mounted) {
        setState(() {
          _receipt = booking;
          _step = 3;
        });
      }
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final titles = [
      '1. Lab Chunein',
      '2. Test Chunein',
      '3. Pata aur Samay',
      '4. Booking Receipt',
    ];
    return Scaffold(
      appBar: AppBar(
        title: Text(titles[_step]),
        leading: _step > 0 && _step < 3
            ? IconButton(
                icon: const Icon(Icons.arrow_back),
                onPressed: () => setState(() {
                  _error = null;
                  _step -= 1;
                }),
              )
            : null,
      ),
      body: Column(
        children: [
          if (_error != null)
            Container(
              width: double.infinity,
              color: Colors.red.shade50,
              padding: const EdgeInsets.all(12),
              child: Text(
                _error!,
                style: TextStyle(
                  color: Colors.red.shade900,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          Expanded(
            child: _loading
                ? const Center(child: CircularProgressIndicator())
                : _step == 0
                    ? _buildLabList()
                    : _step == 1
                        ? _buildTestSelector()
                        : _step == 2
                            ? _buildDetailsForm()
                            : _buildReceipt(),
          ),
        ],
      ),
    );
  }

  Widget _buildLabList() {
    if (_labs.isEmpty) {
      return const Center(
        child: Text('Is gaon ke liye koi lab uplabdh nahi hai'),
      );
    }
    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _labs.length,
      itemBuilder: (_, i) {
        final lab = _labs[i];
        return Card(
          margin: const EdgeInsets.only(bottom: 12),
          child: ListTile(
            contentPadding: const EdgeInsets.all(16),
            title: Text(
              lab['name']?.toString() ?? '',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            subtitle: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 4),
                Text(lab['address']?.toString() ?? ''),
                const SizedBox(height: 4),
                Text(
                  'Home collection: Rs.${lab['collectionFee'] ?? 0} (Rs.${lab['freeCollectionAbove'] ?? 0}+ par free)',
                  style: const TextStyle(
                    color: Color(0xFF0F766E),
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            trailing: const Icon(Icons.chevron_right),
            onTap: () => _selectLab(lab),
          ),
        );
      },
    );
  }

  Widget _buildTestSelector() {
    final filtered = _tests.where((JsonMap t) {
      if (_testQuery.isEmpty) return true;
      return (t['name']?.toString() ?? '')
          .toLowerCase()
          .contains(_testQuery.toLowerCase());
    }).toList();

    final belowMin = _estimatedTestTotal < _minOrderValue;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(12),
          child: TextField(
            onChanged: (v) => setState(() => _testQuery = v),
            decoration: const InputDecoration(
              hintText: 'Test khojein (jaise CBC, Sugar)...',
              prefixIcon: Icon(Icons.search),
            ),
          ),
        ),
        Expanded(
          child: ListView.builder(
            itemCount: filtered.length,
            itemBuilder: (_, i) {
              final t = filtered[i];
              final id = (t['_id'] ?? t['id']).toString();
              final checked = _selectedTestIds.contains(id);
              return CheckboxListTile(
                value: checked,
                onChanged: (val) {
                  setState(() {
                    if (val == true) {
                      _selectedTestIds.add(id);
                    } else {
                      _selectedTestIds.remove(id);
                    }
                  });
                },
                title: Text(
                  t['name']?.toString() ?? '',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  'Rs.${t['listingPrice']} - Report: ${t['reportTimeHours'] ?? 24} ghante${t['fastingRequired'] == true ? ' - Khali pet' : ''}',
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey.shade100,
            border: Border(top: BorderSide(color: Colors.grey.shade300)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Anumaanit Kul (${_selectedTestIds.length} test):',
                    style: const TextStyle(fontSize: 16),
                  ),
                  Text(
                    'Rs.${_estimatedTestTotal + _estimatedCollectionFee}',
                    style: const TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              Text(
                'Test: Rs.$_estimatedTestTotal + Collection: Rs.$_estimatedCollectionFee',
                style: const TextStyle(fontSize: 14, color: Colors.black54),
              ),
              if (_selectedTestIds.isNotEmpty && belowMin)
                Padding(
                  padding: const EdgeInsets.only(top: 6),
                  child: Text(
                    'Kam se kam Rs.$_minOrderValue ka order zaroori hai',
                    style: const TextStyle(
                      color: Colors.red,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              const SizedBox(height: 10),
              ElevatedButton(
                onPressed: (_selectedTestIds.isEmpty || belowMin)
                    ? null
                    : _goToDetails,
                child: const Text('Aage Badhein'),
              ),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildDetailsForm() {
    final days = IstDates.nextSevenDays();
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Kiske liye jaanch hai?',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
          ),
          const SizedBox(height: 8),
          DropdownButtonFormField<String?>(
            value: _selectedFamilyId,
            items: [
              const DropdownMenuItem(value: null, child: Text('Mere liye (Self)')),
              ..._family.map((JsonMap m) {
                return DropdownMenuItem<String?>(
                  value: (m['_id'] ?? m['id']).toString(),
                  child: Text('${m['name']} (${m['relation'] ?? 'Parivar'})'),
                );
              }),
            ],
            onChanged: (v) => setState(() => _selectedFamilyId = v),
          ),
          const SizedBox(height: 16),
          TextField(
            controller: _addressCtrl,
            maxLines: 2,
            decoration: const InputDecoration(
              labelText: 'Ghar ka poora pata (Landmark ke saath)',
              prefixIcon: Icon(Icons.home),
            ),
          ),
          const SizedBox(height: 16),
          const Text(
            'Tareekh chunein:',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: days.map((d) {
              final selected =
                  IstDates.toApiDate(d) == IstDates.toApiDate(_selectedDate);
              return ChoiceChip(
                label: Text(IstDates.toHindiLabel(d)),
                selected: selected,
                onSelected: (_) => setState(() => _selectedDate = d),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          const Text(
            'Samay (Slot) chunein:',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
          ),
          const SizedBox(height: 8),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: IstDates.canonicalSlots.map((slot) {
              return ChoiceChip(
                label: Text(slot),
                selected: _selectedSlot == slot,
                onSelected: (_) => setState(() => _selectedSlot = slot),
              );
            }).toList(),
          ),
          const SizedBox(height: 16),
          const Text(
            'Payment ka tarika:',
            style: TextStyle(fontWeight: FontWeight.bold, fontSize: 17),
          ),
          Row(
            children: [
              Expanded(
                child: RadioListTile<String>(
                  title: const Text('Cash'),
                  value: 'cash',
                  groupValue: _paymentMode,
                  onChanged: (v) => setState(() => _paymentMode = v!),
                ),
              ),
              Expanded(
                child: RadioListTile<String>(
                  title: const Text('UPI'),
                  value: 'upi',
                  groupValue: _paymentMode,
                  onChanged: (v) => setState(() => _paymentMode = v!),
                ),
              ),
            ],
          ),
          CheckboxListTile(
            value: _consent,
            onChanged: (v) => setState(() => _consent = v ?? false),
            title: const Text(
              'Main apni jaanch report lab aur doctor ke saath share karne ki sehmati deta/deti hoon.',
            ),
          ),
          const SizedBox(height: 20),
          ElevatedButton(
            onPressed: _submitBooking,
            child: const Text('Booking Confirm Karein'),
          ),
        ],
      ),
    );
  }

  Widget _buildReceipt() {
    final r = _receipt ?? <String, dynamic>{};
    final code = r['code']?.toString() ?? '';
    final otp = r['otp']?.toString() ?? '';
    final total = r['total'] ?? (_estimatedTestTotal + _estimatedCollectionFee);
    final labPhone = _selectedLab?['phone']?.toString() ?? '';

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Icon(Icons.check_circle, color: Colors.green, size: 72),
          const SizedBox(height: 12),
          const Text(
            'Booking Ho Gayi!',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              border: Border.all(color: Colors.grey.shade400),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Column(
              children: [
                Text(
                  'Booking Code: $code',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    fontFamily: 'monospace',
                  ),
                ),
                const Divider(height: 24),
                const Text(
                  'Sample dene ke waqt yeh OTP collector ko batayein:',
                ),
                const SizedBox(height: 8),
                Text(
                  otp,
                  style: const TextStyle(
                    fontSize: 36,
                    fontWeight: FontWeight.w900,
                    letterSpacing: 8,
                    fontFamily: 'monospace',
                  ),
                ),
                const Divider(height: 24),
                Text(
                  'Kul Rashi: Rs.$total (${_paymentMode.toUpperCase()})',
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                Text('Tareekh: ${r['date']} - ${r['slot']}'),
              ],
            ),
          ),
          const SizedBox(height: 20),
          if (labPhone.isNotEmpty)
            OutlinedButton.icon(
              onPressed: () => launchUrl(Uri.parse('tel:$labPhone')),
              icon: const Icon(Icons.call),
              label: Text('Lab ko call karein ($labPhone)'),
            ),
          const SizedBox(height: 12),
          OutlinedButton.icon(
            onPressed: () {
              final msg = Uri.encodeComponent(
                'NidaanSetu Booking $code confirmed. Date: ${r['date']}, Slot: ${r['slot']}, Total: Rs.$total',
              );
              launchUrl(
                Uri.parse('https://wa.me/?text=$msg'),
                mode: LaunchMode.externalApplication,
              );
            },
            icon: const Icon(Icons.share),
            label: const Text('WhatsApp par bhejein'),
          ),
          const SizedBox(height: 12),
          ElevatedButton(
            onPressed: () => context.go('/home'),
            child: const Text('Home par jayein'),
          ),
        ],
      ),
    );
  }
}