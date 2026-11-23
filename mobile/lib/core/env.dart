class Env {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://10.0.2.2:5050',
  );

  static const String flavor = String.fromEnvironment(
    'FLAVOR',
    defaultValue: 'dev',
  );

  static bool get isDev => flavor == 'dev';
  static String get baseApiUrl => '$apiUrl/api/v1';
}