import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_error.dart';
import '../../core/utils/ist_dates.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/patient_repo.dart';
import 'village_provider.dart';

final myAppointmentsProvider =
    FutureProvider.autoDispose<List<JsonMap>>((ref) {
  return ref.read(patientRepoProvider).getMyAppointments();
});

class BookDoctorScreen extends ConsumerStatefulWidget {
  const BookDoctorScreen({super.key});

  @override
  ConsumerState<BookDoctorScreen> createState() => _BookDoctorScreenState();
}

class _BookDoctorScreenState extends ConsumerState<BookDoctorScreen> {
  final _searchCtrl = TextEditingController();
  List<JsonMap> _doctors = [];
  JsonMap? _selectedDoctor;
  List<String> _slots = [];
  String? _selectedSlot;
  List<JsonMap> _family = [];
  String? _selectedFamilyId;
  final _notesCtrl = TextEditingController();
  late DateTime _selectedDate;

  bool _loadingDoctors = true;
  bool _loadingSlots = false;
  bool _submitting = false;
  JsonMap? _confirmedToken;
  String? _error;

  @override
  void initState() {
    super.initState();
    _selectedDate = IstDates.nextSevenDays().first;
    _loadDoctors();
    _loadFamily();
  }

  Future<void> _loadDoctors([String? q]) async {
    setState(() {
      _loadingDoctors = true;
      _error = null;
    });
    try {
      final village = ref.read(selectedVillageProvider);
      final villageId = (village?['_id'] ?? village?['id'])?.toString();
      final docs = await ref
          .read(patientRepoProvider)
          .getDoctors(villageId: villageId, query: q);
      if (mounted) setState(() => _doctors = docs);
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loadingDoctors = false);
    }
  }

  Future<void> _loadFamily() async {
    try {
      final fam = await ref.read(patientRepoProvider).getFamilyMembers();
      if (mounted) setState(() => _family = fam);
    } catch (_) {}
  }

  Future<void> _selectDoctor(JsonMap doc) async {
    setState(() {
      _selectedDoctor = doc;
      _selectedSlot = null;
      _slots = [];
      _confirmedToken = null;
      _error = null;
    });
    await _loadAvailability();
  }

  Future<void> _loadAvailability() async {
    final doc = _selectedDoctor;
    if (doc == null) return;
    setState(() {
      _loadingSlots = true;
      _selectedSlot = null;
      _error = null;
    });
    try {
      final docId = (doc['_id'] ?? doc['id']).toString();
      final res = await ref
          .read(patientRepoProvider)
          .getDoctorAvailability(docId, date: IstDates.toApiDate(_selectedDate));
      final rawSlots = res['slots'] ?? res['data'] ?? [];
      final parsedSlots = (rawSlots is List ? rawSlots : <dynamic>[])
          .map((item) => item is Map ? (item['slot'] ?? item['label'] ?? '').toString() : item.toString())
          .where((s) => s.isNotEmpty)
          .toList();
      if (mounted) {
        setState(() {
          _slots = parsedSlots.isNotEmpty ? parsedSlots : IstDates.canonicalSlots;
          if (_slots.isNotEmpty) _selectedSlot = _slots.first;
        });
      }
    } on ApiError catch (e) {
      if (mounted) {
        setState(() {
          _slots = IstDates.canonicalSlots;
          _selectedSlot = _slots.first;
          _error = e.message;
        });
      }
    } finally {
      if (mounted) setState(() => _loadingSlots = false);
    }
  }

  Future<void> _bookToken() async {
    final doc = _selectedDoctor;
    if (doc == null || _selectedSlot == null) {
      setState(() => _error = 'Doctor aur samay (slot) chunein');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      final village = ref.read(selectedVillageProvider);
      final villageId = (village?['_id'] ?? village?['id'])?.toString();
      final docId = (doc['_id'] ?? doc['id']).toString();

      final appt = await ref.read(patientRepoProvider).createAppointment(
            doctorId: docId,
            date: IstDates.toApiDate(_selectedDate),
            slot: _selectedSlot!,
            villageId: villageId,
            familyMemberId: _selectedFamilyId,
            notes: _notesCtrl.text,
          );

      ref.invalidate(myAppointmentsProvider);
      if (mounted) setState(() => _confirmedToken = appt);
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_confirmedToken != null) {
      final tokenNo = _confirmedToken!['tokenNumber'] ??
          _confirmedToken!['token'] ??
          _confirmedToken!['code'] ??
          'CONFIRMED';
      return Scaffold(
        appBar: AppBar(title: const Text('Doctor Token Confirmed')),
        body: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Icon(Icons.check_circle, color: Colors.green, size: 76),
              const SizedBox(height: 16),
              const Text(
                'Aapka Token Book Ho Gaya!',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 16),
              Container(
                padding: const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade400),
                  borderRadius: BorderRadius.circular(14),
                ),
                child: Column(
                  children: [
                    Text(
                      'Token: #$tokenNo',
                      style: const TextStyle(
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        fontFamily: 'monospace',
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text('Doctor: ${_selectedDoctor?['name'] ?? ''}'),
                    Text(
                      'Tareekh: ${IstDates.toApiDate(_selectedDate)} - $_selectedSlot',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () => context.go('/my-appointments'),
                child: const Text('Meri Appointments Dekhein'),
              ),
              const SizedBox(height: 12),
              OutlinedButton(
                onPressed: () => context.go('/home'),
                child: const Text('Home par jayein'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(title: const Text('Doctor Token Book Karein')),
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
          if (_selectedDoctor == null) ...[
            Padding(
              padding: const EdgeInsets.all(12),
              child: TextField(
                controller: _searchCtrl,
                onChanged: (v) => _loadDoctors(v),
                decoration: const InputDecoration(
                  hintText: 'Doctor ya specialization khojein...',
                  prefixIcon: Icon(Icons.search),
                ),
              ),
            ),
            Expanded(
              child: _loadingDoctors
                  ? const Center(child: CircularProgressIndicator())
                  : _doctors.isEmpty
                      ? const Center(child: Text('Koi doctor nahi mila'))
                      : ListView.builder(
                          padding: const EdgeInsets.all(12),
                          itemCount: _doctors.length,
                          itemBuilder: (_, i) {
                            final d = _doctors[i];
                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              child: ListTile(
                                contentPadding: const EdgeInsets.all(14),
                                leading: const CircleAvatar(
                                  backgroundColor: Color(0xFF0F766E),
                                  child: Icon(Icons.medical_services, color: Colors.white),
                                ),
                                title: Text(
                                  d['name']?.toString() ?? '',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                  ),
                                ),
                                subtitle: Text(
                                  '${d['specialization'] ?? 'General Physician'} - Fee: Rs.${d['fee'] ?? 0}',
                                ),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () => _selectDoctor(d),
                              ),
                            );
                          },
                        ),
            ),
          ] else
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    Row(
                      children: [
                        TextButton.icon(
                          onPressed: () => setState(() => _selectedDoctor = null),
                          icon: const Icon(Icons.arrow_back),
                          label: const Text('Doctor Badlein'),
                        ),
                      ],
                    ),
                    Text(
                      _selectedDoctor!['name']?.toString() ?? '',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${_selectedDoctor!['specialization'] ?? ''} - Fee: Rs.${_selectedDoctor!['fee'] ?? 0}',
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Tareekh chunein:',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: IstDates.nextSevenDays().map((d) {
                        final selected =
                            IstDates.toApiDate(d) == IstDates.toApiDate(_selectedDate);
                        return ChoiceChip(
                          label: Text(IstDates.toHindiLabel(d)),
                          selected: selected,
                          onSelected: (_) async {
                            setState(() => _selectedDate = d);
                            await _loadAvailability();
                          },
                        );
                      }).toList(),
                    ),
                    const SizedBox(height: 16),
                    const Text(
                      'Uplabdh Samay (Slot):',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 8),
                    if (_loadingSlots)
                      const Center(child: CircularProgressIndicator())
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _slots.map((slot) {
                          return ChoiceChip(
                            label: Text(slot),
                            selected: _selectedSlot == slot,
                            onSelected: (_) => setState(() => _selectedSlot = slot),
                          );
                        }).toList(),
                      ),
                    const SizedBox(height: 16),
                    DropdownButtonFormField<String?>(
                      value: _selectedFamilyId,
                      decoration: const InputDecoration(labelText: 'Kiske liye token hai?'),
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
                    const SizedBox(height: 12),
                    TextField(
                      controller: _notesCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Lakshan / Note (Optional)',
                      ),
                    ),
                    const SizedBox(height: 20),
                    ElevatedButton(
                      onPressed: _submitting ? null : _bookToken,
                      child: _submitting
                          ? const CircularProgressIndicator()
                          : const Text('Token Confirm Karein'),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class MyAppointmentsScreen extends ConsumerWidget {
  const MyAppointmentsScreen({super.key});

  Future<void> _cancelAppt(BuildContext context, WidgetRef ref, String id) async {
    try {
      await ref.read(patientRepoProvider).cancelAppointment(id);
      ref.invalidate(myAppointmentsProvider);
    } on ApiError catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final apptAsync = ref.watch(myAppointmentsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Meri Appointments')),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(myAppointmentsProvider.future),
        child: apptAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text(err.toString())),
          data: (list) {
            if (list.isEmpty) {
              return const Center(child: Text('Abhi koi appointment nahi hai'));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (_, i) {
                final a = list[i];
                final id = (a['_id'] ?? a['id']).toString();
                final status = (a['status'] ?? 'booked').toString();
                final canCancel = status == 'booked' || status == 'confirmed';
                final docName = a['doctor'] is Map
                    ? a['doctor']['name']?.toString() ?? ''
                    : 'Doctor';
                final token = a['tokenNumber'] ?? a['token'] ?? '';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              token.toString().isNotEmpty ? 'Token #$token' : docName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            Chip(label: Text(status.toUpperCase())),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Doctor: $docName'),
                        Text('Tareekh: ${a['date'] ?? ''} - ${a['slot'] ?? ''}'),
                        if (canCancel) ...[
                          const SizedBox(height: 10),
                          OutlinedButton(
                            onPressed: () => _cancelAppt(context, ref, id),
                            child: const Text('Appointment Cancel Karein'),
                          ),
                        ],
                      ],
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
}