import 'dart:convert';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/auth/auth_controller.dart';
import '../../core/utils/json_map.dart';
import '../../repositories/patient_repo.dart';

class SelectedVillageNotifier extends Notifier<JsonMap?> {
  static const _key = 'nidaansetu_last_village';

  @override
  JsonMap? build() {
    final userVillage = ref.watch(authProvider.select((s) => s.user?.village));
    if (userVillage != null) return asJsonMap(userVillage);
    _loadLocal();
    return null;
  }

  Future<void> _loadLocal() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_key);
    if (raw != null && state == null) {
      state = asJsonMap(jsonDecode(raw));
    }
  }

  Future<void> selectVillage(JsonMap village) async {
    state = village;
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_key, jsonEncode(village));
    final id = (village['_id'] ?? village['id'] ?? '').toString();
    if (id.isNotEmpty) {
      await ref.read(patientRepoProvider).updateVillage(id);
    }
  }
}

final selectedVillageProvider =
    NotifierProvider<SelectedVillageNotifier, JsonMap?>(
  SelectedVillageNotifier.new,
);