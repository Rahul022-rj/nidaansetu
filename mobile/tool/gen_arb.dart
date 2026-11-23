import 'dart:convert';
import 'dart:io';

void main() {
  final mappings = {
    '../client/src/i18n/en.json': 'lib/l10n/app_en.arb',
    '../client/src/i18n/hi.json': 'lib/l10n/app_hi.arb',
  };

  Directory('lib/l10n').createSync(recursive: true);

  for (final entry in mappings.entries) {
    final srcFile = File(entry.key);
    if (!srcFile.existsSync()) {
      stderr.writeln('Missing source file: ${entry.key}');
      exit(1);
    }

    final rawMap = jsonDecode(srcFile.readAsStringSync()) as Map<String, dynamic>;
    final locale = entry.key.contains('hi.json') ? 'hi' : 'en';
    final arbMap = <String, dynamic>{'@@locale': locale};

    void flatten(Map<String, dynamic> map, [String prefix = '']) {
      for (final item in map.entries) {
        final key = prefix.isEmpty ? item.key : '${prefix}_${item.key}';
        final cleanKey = key.replaceAll(RegExp(r'[^a-zA-Z0-9_]'), '_');
        if (item.value is Map<String, dynamic>) {
          flatten(item.value as Map<String, dynamic>, cleanKey);
        } else {
          // Convert {{var}} -> {var}
          final str = item.value.toString().replaceAllMapped(
                RegExp(r'\{\{(\w+)\}\}'),
                (m) => '{${m.group(1)}}',
              );
          arbMap[cleanKey] = str;
        }
      }
    }

    flatten(rawMap);
    const encoder = JsonEncoder.withIndent('  ');
    File(entry.value).writeAsStringSync('${encoder.convert(arbMap)}\n');
    stdout.writeln('Generated ${entry.value} (${arbMap.length - 1} keys)');
  }
}