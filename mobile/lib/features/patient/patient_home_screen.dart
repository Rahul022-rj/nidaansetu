import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/auth/auth_controller.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/patient_repo.dart';
import 'village_provider.dart';

final myBookingsProvider = FutureProvider.autoDispose<List<JsonMap>>((ref) {
  return ref.read(patientRepoProvider).getMyBookings();
});

class PatientHomeScreen extends ConsumerWidget {
  const PatientHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).user;
    final village = ref.watch(selectedVillageProvider);
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Namaste, ${user?.name ?? ''}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            InkWell(
              onTap: () => context.push('/village'),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.location_on,
                    size: 16,
                    color: Color(0xFF0F766E),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    village?['name']?.toString() ?? 'Gaon chunein',
                    style: const TextStyle(
                      fontSize: 14,
                      color: Color(0xFF0F766E),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const Icon(
                    Icons.arrow_drop_down,
                    size: 18,
                    color: Color(0xFF0F766E),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            tooltip: 'Logout',
            icon: const Icon(Icons.logout),
            onPressed: () => ref.read(authProvider.notifier).logout(),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(myBookingsProvider.future),
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            bookingsAsync.when(
              data: (bookings) {
                final active = bookings.where((JsonMap b) {
                  final status = b['status']?.toString();
                  return (status == 'requested' || status == 'confirmed') &&
                      b['otp'] != null;
                }).toList();
                if (active.isEmpty) return const SizedBox.shrink();
                final first = active.first;
                return Container(
                  margin: const EdgeInsets.only(bottom: 20),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    border: Border.all(color: Colors.amber.shade700, width: 2),
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.lock_clock, color: Colors.amber),
                          const SizedBox(width: 8),
                          Text(
                            'Booking ${first['code'] ?? ''}',
                            style: const TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 16,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      const Text(
                        'Sample dene ke waqt yeh OTP collector ko batayein:',
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: Text(
                          first['otp'].toString(),
                          style: const TextStyle(
                            fontSize: 34,
                            fontWeight: FontWeight.w900,
                            letterSpacing: 8,
                            fontFamily: 'monospace',
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
              loading: () => const SizedBox.shrink(),
              error: (_, __) => const SizedBox.shrink(),
            ),
            _ActionCard(
              icon: Icons.biotech,
              color: const Color(0xFF0F766E),
              title: 'Ghar par jaanch (Lab test)',
              subtitle: 'Blood, urine aur baaki jaanch ghar baithe karayein',
              onTap: () {
                if (village == null) {
                  context.push('/village');
                } else {
                  context.push('/book-test');
                }
              },
            ),
            const SizedBox(height: 16),
            _ActionCard(
              icon: Icons.receipt_long,
              color: const Color(0xFF1D4ED8),
              title: 'Meri booking aur Report',
              subtitle:
                  'Booking status dekhein, cancel karein ya report download karein',
              onTap: () => context.push('/my-bookings'),
            ),
            const SizedBox(height: 16),
            _ActionCard(
              icon: Icons.medical_services,
              color: const Color(0xFF047857),
              title: 'Doctor ka Token',
              subtitle: 'Doctor chunein aur samay par token book karein',
              onTap: () {
                if (village == null) {
                  context.push('/village');
                } else {
                  context.push('/book-doctor');
                }
              },
            ),
            const SizedBox(height: 16),
            _ActionCard(
              icon: Icons.event_available,
              color: const Color(0xFF3730A3),
              title: 'Meri Appointments',
              subtitle: 'Apne doctor token dekhein ya cancel karein',
              onTap: () => context.push('/my-appointments'),
            ),
            const SizedBox(height: 16),
            _ActionCard(
              icon: Icons.family_restroom,
              color: const Color(0xFFB45309),
              title: 'Parivar ke Sadasya',
              subtitle: 'Parivar walon ka naam jodein aur unke liye booking karein',
              onTap: () => context.push('/family'),
            ),
          ],
        ),
      ),
    );
  }
}

class _ActionCard extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ActionCard({
    required this.icon,
    required this.color,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: Container(
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          border: Border.all(color: color, width: 1.5),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            CircleAvatar(
              radius: 28,
              backgroundColor: color,
              child: Icon(icon, color: Colors.white, size: 30),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight: FontWeight.bold,
                      color: color,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(subtitle, style: const TextStyle(fontSize: 15)),
                ],
              ),
            ),
            Icon(Icons.arrow_forward_ios, color: color),
          ],
        ),
      ),
    );
  }
}