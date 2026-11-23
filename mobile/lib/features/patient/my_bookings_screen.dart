import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api/api_error.dart';
import '../../repositories/patient_repo.dart';
import 'patient_home_screen.dart';

class MyBookingsScreen extends ConsumerWidget {
  const MyBookingsScreen({super.key});

  Future<void> _confirmCancel(
    BuildContext context,
    WidgetRef ref,
    String id,
  ) async {
    final ok = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Booking Cancel Karein?'),
        content: const Text(
          'Kya aap sach mein yeh jaanch booking cancel karna chahte hain?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Nahi'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Haan, Cancel Karein'),
          ),
        ],
      ),
    );
    if (ok != true) return;

    try {
      await ref.read(patientRepoProvider).cancelBooking(id);
      ref.invalidate(myBookingsProvider);
    } on ApiError catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  Future<void> _openReport(
    BuildContext context,
    WidgetRef ref,
    String id, {
    String? reportName,
  }) async {
    final repo = ref.read(patientRepoProvider);
    try {
      final url = await repo.getReportSignedUrl(id);
      final uri = Uri.parse(url);

      final launchedExternal = await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
      if (launchedExternal) return;

      final launchedDefault = await launchUrl(
        uri,
        mode: LaunchMode.platformDefault,
      );
      if (launchedDefault) return;

      final localPath = await repo.downloadReportToTempFile(
        id,
        suggestedName: reportName,
      );
      final fileUri = Uri.file(localPath);
      final launchedLocal = await launchUrl(
        fileUri,
        mode: LaunchMode.externalApplication,
      );

      if (!launchedLocal && context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Report save hui: $localPath')),
        );
      }
    } on ApiError catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final bookingsAsync = ref.watch(myBookingsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Meri Booking')),
      body: RefreshIndicator(
        onRefresh: () => ref.refresh(myBookingsProvider.future),
        child: bookingsAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (err, _) => Center(child: Text(err.toString())),
          data: (list) {
            if (list.isEmpty) {
              return const Center(child: Text('Abhi tak koi booking nahi hai'));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: list.length,
              itemBuilder: (_, i) {
                final b = list[i];
                final id = (b['_id'] ?? b['id']).toString();
                final status = (b['status'] ?? '').toString();
                final canCancel =
                    status == 'requested' || status == 'confirmed';
                final reportMap =
                    b['report'] is Map ? b['report'] as Map : null;
                final reportReady =
                    status == 'report_ready' || reportMap != null;
                final reportName = reportMap?['name']?.toString();
                final tests = (b['tests'] as List<dynamic>? ?? [])
                    .map((t) => t['name']?.toString() ?? '')
                    .where((s) => s.isNotEmpty)
                    .join(', ');

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
                        Text(
                          'Lab: ${b['lab']?['name'] ?? ''}',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        Text('Tests: $tests'),
                        Text('Date: ${b['date']} • ${b['slot']}'),
                        Text(
                          'Kul Rashi: ₹${b['total'] ?? 0}',
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                        if (canCancel && b['otp'] != null) ...[
                          const SizedBox(height: 10),
                          Container(
                            padding: const EdgeInsets.all(10),
                            color: Colors.amber.shade50,
                            child: Text(
                              'Collector OTP: ${b['otp']}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                                fontFamily: 'monospace',
                              ),
                            ),
                          ),
                        ],
                        const SizedBox(height: 12),
                        if (reportReady)
                          ElevatedButton.icon(
                            onPressed: () => _openReport(
                              context,
                              ref,
                              id,
                              reportName: reportName,
                            ),
                            icon: const Icon(Icons.picture_as_pdf),
                            label: const Text('Report Dekhein'),
                          ),
                        if (canCancel)
                          OutlinedButton(
                            onPressed: () => _confirmCancel(context, ref, id),
                            child: const Text('Booking Cancel Karein'),
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