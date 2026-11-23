import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../core/api/api_error.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/public_repo.dart';
import 'village_provider.dart';

class VillagePickerScreen extends ConsumerStatefulWidget {
  const VillagePickerScreen({super.key});

  @override
  ConsumerState<VillagePickerScreen> createState() => _VillagePickerScreenState();
}

class _VillagePickerScreenState extends ConsumerState<VillagePickerScreen> {
  final _searchCtrl = TextEditingController();
  List<JsonMap> _villages = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load([String? q]) async {
    setState(() {
      _loading = true;
      _error = null;
    });
    try {
      final list = await ref.read(publicRepoProvider).getVillages(query: q);
      if (mounted) setState(() => _villages = list);
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _pick(JsonMap v) async {
    try {
      await ref.read(selectedVillageProvider.notifier).selectVillage(v);
      if (mounted) context.go('/home');
    } on ApiError catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.message)));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Apna Gaon Chunein')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(
              controller: _searchCtrl,
              onChanged: (val) => _load(val),
              decoration: const InputDecoration(
                hintText: 'Gaon ka naam khojein...',
                prefixIcon: Icon(Icons.search),
              ),
            ),
            const SizedBox(height: 16),
            if (_loading)
              const Expanded(child: Center(child: CircularProgressIndicator()))
            else if (_error != null)
              Expanded(
                child: Center(
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              )
            else if (_villages.isEmpty)
              const Expanded(child: Center(child: Text('Koi gaon nahi mila')))
            else
              Expanded(
                child: ListView.separated(
                  itemCount: _villages.length,
                  separatorBuilder: (_, __) => const Divider(),
                  itemBuilder: (_, i) {
                    final v = _villages[i];
                    return ListTile(
                      contentPadding:
                          const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
                      leading: const Icon(
                        Icons.location_on,
                        color: Color(0xFF0F766E),
                        size: 32,
                      ),
                      title: Text(
                        v['name']?.toString() ?? '',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      subtitle: Text(
                        'Block: ${v['block'] ?? '-'}, ${v['district'] ?? 'Siwan'}',
                      ),
                      trailing: const Icon(Icons.chevron_right),
                      onTap: () => _pick(v),
                    );
                  },
                ),
              ),
          ],
        ),
      ),
    );
  }
}