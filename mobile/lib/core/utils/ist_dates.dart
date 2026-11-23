import 'package:intl/intl.dart';

class IstDates {
  static DateTime nowIst() {
    final utcNow = DateTime.now().toUtc();
    return utcNow.add(const Duration(hours: 5, minutes: 30));
  }

  static List<DateTime> nextSevenDays() {
    final base = nowIst();
    final startOfDay = DateTime(base.year, base.month, base.day);
    return List.generate(7, (i) => startOfDay.add(Duration(days: i)));
  }

  static String toApiDate(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  static String toHindiLabel(DateTime date) {
    final now = nowIst();
    final today = DateTime(now.year, now.month, now.day);
    final diff = date.difference(today).inDays;
    final datePart = DateFormat('d MMM', 'hi_IN').format(date);
    if (diff == 0) return 'Aaj, $datePart';
    if (diff == 1) return 'Kal, $datePart';
    return '${DateFormat('EEEE', 'hi_IN').format(date)}, $datePart';
  }

  static const List<String> canonicalSlots = [
    'Subah 6–8 baje',
    'Subah 8–10 baje',
    'Din 10–12 baje',
  ];
}