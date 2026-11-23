typedef JsonMap = Map<String, dynamic>;

JsonMap asJsonMap(dynamic raw) {
  if (raw is Map<String, dynamic>) return raw;
  if (raw is Map) return Map<String, dynamic>.from(raw);
  return <String, dynamic>{};
}

List<JsonMap> asJsonMapList(dynamic raw) {
  if (raw is List) {
    return raw.map((item) => asJsonMap(item)).toList();
  }
  return <JsonMap>[];
}