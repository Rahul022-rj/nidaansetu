import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../core/api/api_error.dart';
import '../../core/auth/auth_controller.dart';
import '../../core/env.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(Icons.health_and_safety, size: 72, color: Color(0xFF0F766E)),
            SizedBox(height: 16),
            Text('NidaanSetu', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
            SizedBox(height: 24),
            CircularProgressIndicator(),
          ],
        ),
      ),
    );
  }
}

class LandingScreen extends ConsumerWidget {
  const LandingScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final isHi = auth.locale.languageCode == 'hi';

    return Scaffold(
      appBar: AppBar(
        title: const Text('NidaanSetu'),
        actions: [
          TextButton.icon(
            onPressed: () => ref.read(authProvider.notifier).setLocale(isHi ? 'en' : 'hi'),
            icon: const Icon(Icons.language),
            label: Text(isHi ? 'English' : 'हिंदी', style: const TextStyle(fontSize: 16)),
          ),
        ],
      ),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Spacer(),
              const Icon(Icons.medical_services_rounded, size: 80, color: Color(0xFF0F766E)),
              const SizedBox(height: 16),
              Text(
                isHi ? 'Jaanch aapke dwaar' : 'Diagnostics at your doorstep',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.headlineMedium,
              ),
              const SizedBox(height: 8),
              Text(
                isHi
                    ? 'Ghar baithe lab test aur doctor ka token book karein'
                    : 'Book home lab tests and doctor tokens easily',
                textAlign: TextAlign.center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              const Spacer(),
              ElevatedButton.icon(
                onPressed: () => context.push('/login/patient'),
                icon: const Icon(Icons.person),
                label: Text(isHi ? 'Main mareez hoon (Mobile se)' : 'I am a Patient (Mobile)'),
              ),
              const SizedBox(height: 12),
              OutlinedButton.icon(
                onPressed: () => context.push('/signup'),
                icon: const Icon(Icons.person_add),
                label: Text(isHi ? 'Naya account banayein' : 'Create new account'),
              ),
              const SizedBox(height: 24),
              TextButton.icon(
                onPressed: () => context.push('/login/staff'),
                icon: const Icon(Icons.badge_outlined),
                label: Text(
                  isHi ? 'Main staff hoon (Lab / Doctor / Agent)' : 'Staff Login (Email)',
                  style: const TextStyle(fontSize: 16),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class LoginScreen extends ConsumerStatefulWidget {
  final String portal; // 'patient' or 'staff'
  const LoginScreen({super.key, required this.portal});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _idCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _errorMsg;

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _errorMsg = null;
    });
    try {
      await ref.read(authProvider.notifier).login(
            identifier: _idCtrl.text,
            password: _passCtrl.text,
            portal: widget.portal,
          );
    } on ApiError catch (e) {
      setState(() => _errorMsg = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isPatient = widget.portal == 'patient';
    return Scaffold(
      appBar: AppBar(title: Text(isPatient ? 'Mareez Login' : 'Staff Login')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMsg != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(_errorMsg!, style: TextStyle(color: Colors.red.shade900, fontSize: 16)),
              ),
            TextField(
              controller: _idCtrl,
              keyboardType: isPatient ? TextInputType.phone : TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: isPatient ? '10 ankon ka mobile number' : 'Staff Email',
                prefixIcon: Icon(isPatient ? Icons.phone : Icons.email),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passCtrl,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'Password',
                prefixIcon: const Icon(Icons.lock),
                suffixIcon: IconButton(
                  icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const CircularProgressIndicator() : const Text('Login karein'),
            ),
            if (isPatient) ...[
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => context.push('/signup'),
                child: const Text('Account nahi hai? Naya banayein', style: TextStyle(fontSize: 16)),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class SignupScreen extends ConsumerStatefulWidget {
  const SignupScreen({super.key});

  @override
  ConsumerState<SignupScreen> createState() => _SignupScreenState();
}

class _SignupScreenState extends ConsumerState<SignupScreen> {
  final _nameCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  bool _obscure = true;
  bool _loading = false;
  String? _errorMsg;
  Map<String, dynamic>? _fieldErrors;

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _errorMsg = null;
      _fieldErrors = null;
    });
    try {
      await ref.read(authProvider.notifier).signup(
            name: _nameCtrl.text,
            phone: _phoneCtrl.text,
            password: _passCtrl.text,
          );
    } on ApiError catch (e) {
      setState(() {
        _errorMsg = e.message;
        _fieldErrors = e.details;
      });
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Naya Mareez Account')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            if (_errorMsg != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                decoration: BoxDecoration(
                  color: Colors.red.shade50,
                  border: Border.all(color: Colors.red),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(_errorMsg!, style: TextStyle(color: Colors.red.shade900)),
              ),
            TextField(
              controller: _nameCtrl,
              decoration: InputDecoration(
                labelText: 'Poora Naam',
                errorText: _fieldErrors?['name']?.toString(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _phoneCtrl,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Mobile Number (10 ank)',
                errorText: _fieldErrors?['phone']?.toString(),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _passCtrl,
              obscureText: _obscure,
              decoration: InputDecoration(
                labelText: 'Password (8+ akshar aur ank)',
                errorText: _fieldErrors?['password']?.toString(),
                suffixIcon: IconButton(
                  icon: Icon(_obscure ? Icons.visibility : Icons.visibility_off),
                  onPressed: () => setState(() => _obscure = !_obscure),
                ),
              ),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const CircularProgressIndicator() : const Text('Account banayein'),
            ),
          ],
        ),
      ),
    );
  }
}

class ChangePasswordScreen extends ConsumerStatefulWidget {
  const ChangePasswordScreen({super.key});

  @override
  ConsumerState<ChangePasswordScreen> createState() => _ChangePasswordScreenState();
}

class _ChangePasswordScreenState extends ConsumerState<ChangePasswordScreen> {
  final _curCtrl = TextEditingController();
  final _newCtrl = TextEditingController();
  bool _loading = false;
  String? _errorMsg;

  Future<void> _submit() async {
    setState(() {
      _loading = true;
      _errorMsg = null;
    });
    try {
      await ref.read(authProvider.notifier).changePassword(
            currentPassword: _curCtrl.text,
            newPassword: _newCtrl.text,
          );
    } on ApiError catch (e) {
      setState(() => _errorMsg = e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Naya Password Set Karein')),
      body: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Pehli baar login ke liye naya password banana zaroori hai.'),
            const SizedBox(height: 16),
            if (_errorMsg != null)
              Text(_errorMsg!, style: const TextStyle(color: Colors.red)),
            TextField(
              controller: _curCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Purana / Temporary Password'),
            ),
            const SizedBox(height: 16),
            TextField(
              controller: _newCtrl,
              obscureText: true,
              decoration: const InputDecoration(labelText: 'Naya Password'),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: _loading ? null : _submit,
              child: _loading ? const CircularProgressIndicator() : const Text('Save karein'),
            ),
          ],
        ),
      ),
    );
  }
}

class AdminWebOnlyScreen extends ConsumerWidget {
  const AdminWebOnlyScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Scaffold(
      appBar: AppBar(title: const Text('Super Admin')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.computer, size: 72, color: Color(0xFF0F766E)),
            const SizedBox(height: 16),
            const Text(
              'Admin panel website par kholein',
              textAlign: TextAlign.center,
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            ElevatedButton(
              onPressed: () => launchUrl(Uri.parse(Env.apiUrl.replaceAll(':5050', ':5173'))),
              child: const Text('Website Kholein'),
            ),
            const SizedBox(height: 12),
            OutlinedButton(
              onPressed: () => ref.read(authProvider.notifier).logout(),
              child: const Text('Logout'),
            ),
          ],
        ),
      ),
    );
  }
}