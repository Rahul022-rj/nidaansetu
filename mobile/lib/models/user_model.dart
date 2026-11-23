class AppUser {
  final String id;
  final String name;
  final String? phone;
  final String? email;
  final String role;
  final bool mustChangePassword;
  final Map<String, dynamic>? village;
  final Map<String, dynamic>? lab;
  final Map<String, dynamic>? doctor;

  const AppUser({
    required this.id,
    required this.name,
    this.phone,
    this.email,
    required this.role,
    this.mustChangePassword = false,
    this.village,
    this.lab,
    this.doctor,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: (json['_id'] ?? json['id'] ?? '').toString(),
      name: (json['name'] ?? '').toString(),
      phone: json['phone']?.toString(),
      email: json['email']?.toString(),
      role: (json['role'] ?? 'patient').toString(),
      mustChangePassword: json['mustChangePassword'] == true,
      village: json['village'] is Map<String, dynamic> ? json['village'] as Map<String, dynamic> : null,
      lab: json['lab'] is Map<String, dynamic> ? json['lab'] as Map<String, dynamic> : null,
      doctor: json['doctor'] is Map<String, dynamic> ? json['doctor'] as Map<String, dynamic> : null,
    );
  }
}