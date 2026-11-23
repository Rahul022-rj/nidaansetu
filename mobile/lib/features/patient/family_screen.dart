import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/api/api_error.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/patient_repo.dart';

final familyMembersProvider = FutureProvider.autoDispose<List<JsonMap>>((ref) {
  return ref.read(patientRepoProvider).getFamilyMembers();
});

class FamilyScreen extends ConsumerStatefulWidget {
  const FamilyScreen({super.key});

  @override
  ConsumerState<FamilyScreen> createState() => _FamilyScreenState();
}

class _FamilyScreenState extends ConsumerState<FamilyScreen> {
  final _nameCtrl = TextEditingController();
  final _ageCtrl = TextEditingController();
  String _relation = 'Mata / Pita';
  String _gender = 'female';
  bool _saving = false;
  String? _error;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _ageCtrl.dispose();
    super.dispose();
  }

  Future<void> _addMember() async {
    if (_nameCtrl.text.trim().length < 2) {
      setState(() => _error = 'Parivar ke sadasya ka poora naam likhein');
      return;
    }

    setState(() {
      _saving = true;
      _error = null;
    });

    try {
      final parsedAge = int.tryParse(_ageCtrl.text.trim());
      await ref.read(patientRepoProvider).addFamilyMember(
            name: _nameCtrl.text,
            relation: _relation,
            age: parsedAge,
            gender: _gender,
          );
      _nameCtrl.clear();
      _ageCtrl.clear();
      ref.invalidate(familyMembersProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Parivar ke sadasya jud gaye')),
        );
      }
    } on ApiError catch (e) {
      if (mounted) setState(() => _error = e.message);
    } finally {
      if (mounted) setState(() => _saving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final membersAsync = ref.watch(familyMembersProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Parivar Ke Sadasya')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Text(
                    'Naya Sadasya Jodein',
                    style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 12),
                  if (_error != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Text(
                        _error!,
                        style: const TextStyle(
                          color: Colors.red,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  TextField(
                    controller: _nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Naam',
                      prefixIcon: Icon(Icons.person),
                    ),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _relation,
                    decoration: const InputDecoration(labelText: 'Rishta'),
                    items: const [
                      DropdownMenuItem(
                        value: 'Mata / Pita',
                        child: Text('Mata / Pita'),
                      ),
                      DropdownMenuItem(
                        value: 'Humsafar (Spouse)',
                        child: Text('Humsafar (Spouse)'),
                      ),
                      DropdownMenuItem(
                        value: 'Bachcha (Child)',
                        child: Text('Bachcha (Child)'),
                      ),
                      DropdownMenuItem(
                        value: 'Anya (Other)',
                        child: Text('Anya (Other)'),
                      ),
                    ],
                    onChanged: (v) {
                      if (v != null) setState(() => _relation = v);
                    },
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _ageCtrl,
                          keyboardType: TextInputType.number,
                          decoration:
                              const InputDecoration(labelText: 'Umr (Saal)'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: DropdownButtonFormField<String>(
                          value: _gender,
                          decoration: const InputDecoration(labelText: 'Ling'),
                          items: const [
                            DropdownMenuItem(
                              value: 'female',
                              child: Text('Mahila'),
                            ),
                            DropdownMenuItem(
                              value: 'male',
                              child: Text('Purush'),
                            ),
                            DropdownMenuItem(
                              value: 'other',
                              child: Text('Anya'),
                            ),
                          ],
                          onChanged: (v) {
                            if (v != null) setState(() => _gender = v);
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton(
                    onPressed: _saving ? null : _addMember,
                    child: _saving
                        ? const CircularProgressIndicator()
                        : const Text('Sadasya Jodein'),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 20),
          const Text(
            'Maujooda Sadasya',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          membersAsync.when(
            loading: () => const Center(child: CircularProgressIndicator()),
            error: (err, _) => Text(err.toString()),
            data: (members) {
              if (members.isEmpty) {
                return const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Text('Abhi koi parivar sadasya nahi joda gaya hai.'),
                  ),
                );
              }
              return Column(
                children: members.map((m) {
                  return Card(
                    margin: const EdgeInsets.only(bottom: 10),
                    child: ListTile(
                      leading: const CircleAvatar(
                        backgroundColor: Color(0xFF0F766E),
                        child: Icon(Icons.family_restroom, color: Colors.white),
                      ),
                      title: Text(
                        m['name']?.toString() ?? '',
                        style: const TextStyle(fontWeight: FontWeight.bold),
                      ),
                      subtitle: Text(
                        '${m['relation'] ?? 'Parivar'}${m['age'] != null ? ' - ${m['age']} saal' : ''}',
                      ),
                    ),
                  );
                }).toList(),
              );
            },
          ),
        ],
      ),
    );
  }
}