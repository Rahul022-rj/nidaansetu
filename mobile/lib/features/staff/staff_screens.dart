import 'package:file_picker/file_picker.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_error.dart';
import '../../core/auth/auth_controller.dart';
import '../../core/utils/ist_dates.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/public_repo.dart';
import '../../repositories/staff_repo.dart';

final labQueueProvider = FutureProvider.autoDispose<List<JsonMap>>((ref) {
  return ref.read(staffRepoProvider).getLabBookings();
});

final doctorQueueProvider = FutureProvider.autoDispose<List<JsonMap>>((ref) {
  final today = IstDates.toApiDate(IstDates.nowIst());
  return ref.read(staffRepoProvider).getDoctorAppointments(date: today);
});

class LabQueueScreen extends ConsumerStatefulWidget {
  const LabQueueScreen({super.key});

  @override
  ConsumerState<LabQueueScreen> createState() => _LabQueueScreenState();
}

class _LabQueueScreenState extends ConsumerState<LabQueueScreen> {
  Future<void> _confirmBooking(String bookingId, String? defaultSlot) async {
    final timeCtrl = TextEditingController(
      text: (defaultSlot != null && defaultSlot.trim().isNotEmpty)
          ? defaultSlot.trim()
          : 'Subah 7:00 baje',
    );
    final collectionTime = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Collector ka Samay'),
        content: TextField(
          controller: timeCtrl,
          maxLength: 40,
          decoration: const InputDecoration(
            labelText: 'Collection Time',
            hintText: 'Jaise: Subah 7:30 baje',
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Radd Karein'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, timeCtrl.text.trim()),
            child: const Text('Confirm Karein'),
          ),
        ],
      ),
    );
    if (collectionTime == null || collectionTime.isEmpty) return;

    try {
      await ref.read(staffRepoProvider).confirmBooking(
            bookingId,
            collectionTime: collectionTime,
          );
      ref.invalidate(labQueueProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Booking confirm ho gayi!')),
        );
      }
    } on ApiError catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  Future<void> _collectWithOtp(String bookingId) async {
    final otpCtrl = TextEditingController();
    final otp = await showDialog<String>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Collector OTP Darj Karein'),
        content: TextField(
          controller: otpCtrl,
          keyboardType: TextInputType.number,
          maxLength: 4,
          decoration: const InputDecoration(hintText: '4 ankon ka OTP'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Radd Karein'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, otpCtrl.text.trim()),
            child: const Text('Sample Collect Karein'),
          ),
        ],
      ),
    );
    if (otp == null || otp.isEmpty) return;

    try {
      await ref.read(staffRepoProvider).collectBookingWithOtp(
            bookingId,
            otp: otp,
          );
      ref.invalidate(labQueueProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Sample collect ho gaya!')),
        );
      }
    } on ApiError catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  Future<void> _uploadReport(String bookingId) async {
    final files = await FilePicker.pickFiles(
      type: FileType.custom,
      allowedExtensions: const ['pdf', 'jpg', 'jpeg', 'png'],
    );
    if (files.isEmpty || files.first.path == null) return;

    final file = files.first;
    try {
      await ref.read(staffRepoProvider).uploadReportFile(
            bookingId,
            filePath: file.path!,
            fileName: file.name,
          );
      ref.invalidate(labQueueProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Report upload ho gayi!')),
        );
      }
    } on ApiError catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final queueAsync = ref.watch(labQueueProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Lab Booking Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(labQueueProvider.future),
        child: queueAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text(err.toString())),
          data: (bookings) {
            if (bookings.isEmpty) {
              return const Center(child: Text('Koi lab booking nahi hai'));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: bookings.length,
              itemBuilder: (_, i) {
                final b = bookings[i];
                final id = (b['_id'] ?? b['id']).toString();
                final status = (b['status'] ?? 'requested').toString();
                final patientName = b['patient'] is Map
                    ? b['patient']['name']?.toString() ?? 'Mareez'
                    : 'Mareez';

                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              b['code']?.toString() ?? '',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                                fontFamily: 'monospace',
                              ),
                            ),
                            Chip(label: Text(status.toUpperCase())),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Mareez: $patientName'),
                        Text('Tareekh: ${b['date'] ?? ''} - ${b['slot'] ?? ''}'),
                        Text('Pata: ${b['address'] ?? ''}'),
                        const SizedBox(height: 12),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: [
                            if (status == 'requested')
                              ElevatedButton(
                                onPressed: () => _confirmBooking(
                                  id,
                                  b['slot']?.toString(),
                                ),
                                child: const Text('Confirm Karein'),
                              ),
                            if (status == 'confirmed')
                              ElevatedButton(
                                onPressed: () => _collectWithOtp(id),
                                child: const Text('OTP se Sample Lein'),
                              ),
                            if (status == 'collected')
                              ElevatedButton(
                                onPressed: () => _uploadReport(id),
                                child: const Text('Report Upload Karein'),
                              ),
                          ],
                        ),
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

class DoctorQueueScreen extends ConsumerWidget {
  const DoctorQueueScreen({super.key});

  Future<void> _mark(
    BuildContext context,
    WidgetRef ref,
    String id,
    String status,
  ) async {
    try {
      await ref
          .read(staffRepoProvider)
          .updateAppointmentStatus(id, status: status);
      ref.invalidate(doctorQueueProvider);
    } on ApiError catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final queueAsync = ref.watch(doctorQueueProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Aaj Ki Doctor Queue'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(doctorQueueProvider.future),
        child: queueAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text(err.toString())),
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('Aaj koi token nahi hai'));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (_, i) {
                final a = items[i];
                final id = (a['_id'] ?? a['id']).toString();
                final token = a['tokenNumber'] ?? a['token'] ?? '';
                final status = (a['status'] ?? 'booked').toString();
                final patientName = a['patient'] is Map
                    ? a['patient']['name']?.toString() ?? 'Mareez'
                    : 'Mareez';

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
                              token.toString().isNotEmpty
                                  ? 'Token #$token'
                                  : patientName,
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                                fontSize: 18,
                              ),
                            ),
                            Chip(label: Text(status.toUpperCase())),
                          ],
                        ),
                        const SizedBox(height: 6),
                        Text('Mareez: $patientName'),
                        Text('Slot: ${a['slot'] ?? ''}'),
                        if (a['notes'] != null &&
                            a['notes'].toString().isNotEmpty)
                          Text('Note: ${a['notes']}'),
                        const SizedBox(height: 12),
                        Row(
                          children: [
                            ElevatedButton(
                              onPressed: () =>
                                  _mark(context, ref, id, 'completed'),
                              child: const Text('Complete'),
                            ),
                            const SizedBox(width: 10),
                            OutlinedButton(
                              onPressed: () =>
                                  _mark(context, ref, id, 'no_show'),
                              child: const Text('No Show'),
                            ),
                          ],
                        ),
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

class AgentOnboardingScreen extends ConsumerStatefulWidget {
  const AgentOnboardingScreen({super.key});

  @override
  ConsumerState<AgentOnboardingScreen> createState() =>
      _AgentOnboardingScreenState();
}

class _AgentOnboardingScreenState extends ConsumerState<AgentOnboardingScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController(text: 'Nidaan@2026');
  List<JsonMap> _villages = [];
  String? _selectedVillageId;
  bool _submitting = false;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadVillages();
  }

  Future<void> _loadVillages() async {
    try {
      final list = await ref.read(publicRepoProvider).getVillages();
      if (mounted) {
        setState(() {
          _villages = list;
          if (list.isNotEmpty) {
            _selectedVillageId =
                (list.first['_id'] ?? list.first['id'])?.toString();
          }
        });
      }
    } catch (_) {}
  }

  Future<void> _registerPatient() async {
    final phone = _phoneCtrl.text.trim();
    if (_nameCtrl.text.trim().length < 2) {
      setState(() => _error = 'Mareez ka poora naam likhein');
      return;
    }
    if (!RegExp(r'^[6-9]\d{9}$').hasMatch(phone)) {
      setState(() => _error = 'Sahi 10 ankon ka mobile number likhein');
      return;
    }

    setState(() {
      _submitting = true;
      _error = null;
    });

    try {
      await ref.read(staffRepoProvider).onboardPatient(
            name: _nameCtrl.text,
            phone: phone,
            password: _passCtrl.text,
            villageId: _selectedVillageId,
          );
      _nameCtrl.clear();
      _phoneCtrl.clear();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Naya mareez register ho gaya!')),
        );
      }
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _submitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Agent Patient Onboarding'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_error != null)
              Container(
                margin: const EdgeInsets.only(bottom: 14),
                padding: const EdgeInsets.all(12),
                color: Colors.red.shade50,
                child: Text(
                  _error!,
                  style: TextStyle(
                    color: Colors.red.shade900,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            TextField(
              controller: _nameCtrl,
              decoration: const InputDecoration(
                labelText: 'Mareez ka Naam',
                prefixIcon: Icon(Icons.person_add),
              ),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              maxLength: 10,
              decoration: const InputDecoration(
                labelText: '10 ankon ka Mobile Number',
                prefixIcon: Icon(Icons.phone),
              ),
            ),
            const SizedBox(height: 14),
            DropdownButtonFormField<String?>(
              value: _selectedVillageId,
              decoration: const InputDecoration(labelText: 'Gaon Chunein'),
              items: _villages.map((JsonMap v) {
                return DropdownMenuItem<String?>(
                  value: (v['_id'] ?? v['id']).toString(),
                  child: Text(v['name']?.toString() ?? ''),
                );
              }).toList(),
              onChanged: (v) => setState(() => _selectedVillageId = v),
            ),
            const SizedBox(height: 14),
            TextField(
              controller: _passCtrl,
              decoration: const InputDecoration(
                labelText: 'Shuruati Password',
                prefixIcon: Icon(Icons.lock),
              ),
            ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: _submitting ? null : _registerPatient,
              child: _submitting
                  ? const CircularProgressIndicator()
                  : const Text('Mareez Account Banayein'),
            ),
          ],
        ),
      ),
    );
  }
}