import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  String _role = 'customer';
  String? _statusMessage;
  bool _isSuccess = false;
  bool _isLoading = false;
  final _name = TextEditingController();
  final _email = TextEditingController();
  final _password = TextEditingController();
  final _shopName = TextEditingController();
  final _shopDescription = TextEditingController();
  final _gcashNumber = TextEditingController();

  @override
  void dispose() {
    _name.dispose();
    _email.dispose();
    _password.dispose();
    _shopName.dispose();
    _shopDescription.dispose();
    _gcashNumber.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_role == 'seller') {
      if (_shopName.text.trim().isEmpty) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Shop name required'))); return; }
      if (_gcashNumber.text.trim().isEmpty) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('GCash number required'))); return; }
      if (_shopDescription.text.trim().isEmpty) { ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Artisan story required'))); return; }
    }
    setState(() { _statusMessage = null; _isLoading = true; });
    final data = {
      'name': _name.text.trim(),
      'email': _email.text.trim(),
      'password': _password.text,
      'role': _role,
      if (_role == 'seller') 'shopName': _shopName.text.trim(),
      if (_role == 'seller') 'shopDescription': _shopDescription.text.trim(),
      if (_role == 'seller') 'gcashNumber': _gcashNumber.text.trim(),
    };
    final result = await context.read<AuthProvider>().register(data);
    if (!mounted) return;
    setState(() {
      _isLoading = false;
      _statusMessage = result['message'] as String?;
      _isSuccess = result['success'] == true;
    });
    if (_isSuccess) {
      Future.delayed(const Duration(milliseconds: 1500), () {
        if (mounted) context.go('/home');
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: SafeArea(
        child: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: Container(
              constraints: const BoxConstraints(maxWidth: 520),
              padding: const EdgeInsets.all(32),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(32),
                border: Border.all(color: const Color(0xFFF3F4F6)),
                boxShadow: [BoxShadow(color: Colors.black.withValues(alpha: 0.06), blurRadius: 24, offset: const Offset(0, 8))],
              ),
              child: Form(
                key: _formKey,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    GestureDetector(
                      onTap: () => context.go('/'),
                      child: const Text('LumBarong', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: AppTheme.primary), textAlign: TextAlign.center),
                    ),
                    const SizedBox(height: 20),
                    const Text('Create Your Account', style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900, color: AppTheme.textPrimary), textAlign: TextAlign.center),
                    const SizedBox(height: 8),
                    const Text('Join our community of heritage craft lovers', style: TextStyle(color: AppTheme.textSecondary), textAlign: TextAlign.center),
                    if (_statusMessage != null) ...[
                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: _isSuccess ? Colors.green.shade50 : AppTheme.primary.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(color: _isSuccess ? Colors.green.shade200 : AppTheme.primary.withValues(alpha: 0.3)),
                        ),
                        child: Row(children: [
                          Icon(_isSuccess ? Icons.check_circle : Icons.error_outline, color: _isSuccess ? Colors.green : AppTheme.primary, size: 22),
                          const SizedBox(width: 12),
                          Expanded(child: Text(_statusMessage!, style: TextStyle(color: _isSuccess ? Colors.green.shade800 : AppTheme.primary, fontWeight: FontWeight.w700))),
                        ]),
                      ),
                    ],
                    const SizedBox(height: 20),
                    Container(
                      padding: const EdgeInsets.all(4),
                      decoration: BoxDecoration(color: const Color(0xFFF9FAFB), borderRadius: BorderRadius.circular(20), border: Border.all(color: const Color(0xFFF3F4F6))),
                      child: Row(
                        children: [
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _role = 'customer'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(color: _role == 'customer' ? Colors.white : Colors.transparent, borderRadius: BorderRadius.circular(16), boxShadow: _role == 'customer' ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)] : null),
                                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.shopping_bag, size: 16, color: _role == 'customer' ? AppTheme.primary : AppTheme.textMuted), const SizedBox(width: 8), Text('Buyer', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: _role == 'customer' ? AppTheme.primary : AppTheme.textMuted))]),
                              ),
                            ),
                          ),
                          Expanded(
                            child: GestureDetector(
                              onTap: () => setState(() => _role = 'seller'),
                              child: Container(
                                padding: const EdgeInsets.symmetric(vertical: 12),
                                decoration: BoxDecoration(color: _role == 'seller' ? Colors.white : Colors.transparent, borderRadius: BorderRadius.circular(16), boxShadow: _role == 'seller' ? [BoxShadow(color: Colors.black.withValues(alpha: 0.05), blurRadius: 8)] : null),
                                child: Row(mainAxisAlignment: MainAxisAlignment.center, children: [Icon(Icons.store, size: 16, color: _role == 'seller' ? AppTheme.primary : AppTheme.textMuted), const SizedBox(width: 8), Text('Artisan', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: _role == 'seller' ? AppTheme.primary : AppTheme.textMuted))]),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 20),
                    TextFormField(controller: _name, decoration: const InputDecoration(labelText: 'Full Name', hintText: 'Juan Dela Cruz', prefixIcon: Icon(Icons.person_outline)), validator: (v) => v == null || v.isEmpty ? 'Required' : null),
                    const SizedBox(height: 16),
                    TextFormField(controller: _email, keyboardType: TextInputType.emailAddress, decoration: const InputDecoration(labelText: 'Email Address', hintText: 'juan@example.ph', prefixIcon: Icon(Icons.email_outlined)), validator: (v) => v == null || v.isEmpty ? 'Required' : null),
                    if (_role == 'seller') ...[
                      const SizedBox(height: 16),
                      TextFormField(controller: _shopName, decoration: const InputDecoration(labelText: 'Shop Name', hintText: 'Heritage Shop', prefixIcon: Icon(Icons.store)), validator: _role == 'seller' ? (v) => v == null || v.isEmpty ? 'Required' : null : null),
                      const SizedBox(height: 16),
                      TextFormField(controller: _gcashNumber, decoration: const InputDecoration(labelText: 'GCash Number', hintText: '09xx-xxx-xxxx', prefixIcon: Icon(Icons.phone)), validator: _role == 'seller' ? (v) => v == null || v.isEmpty ? 'Required' : null : null),
                      const SizedBox(height: 16),
                      TextFormField(controller: _shopDescription, maxLines: 3, decoration: const InputDecoration(labelText: 'Artisan Story', hintText: 'Tell us about your heritage craft...'), validator: _role == 'seller' ? (v) => v == null || v.isEmpty ? 'Required' : null : null),
                    ],
                    const SizedBox(height: 16),
                    TextFormField(controller: _password, obscureText: true, decoration: const InputDecoration(labelText: 'Password', hintText: '••••••••', prefixIcon: Icon(Icons.lock_outline)), validator: (v) => v == null || v.isEmpty ? 'Required' : (v.length < 6 ? 'Min 6 characters' : null)),
                    const SizedBox(height: 24),
                    SizedBox(
                      height: 56,
                      child: ElevatedButton(
                        onPressed: _isLoading ? null : _submit,
                        child: _isLoading ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : Row(mainAxisAlignment: MainAxisAlignment.center, children: [Text(_role == 'seller' ? 'Register as Artisan' : 'Create My Account'), const SizedBox(width: 8), const Icon(Icons.arrow_forward)]),
                      ),
                    ),
                    const SizedBox(height: 20),
                    Row(mainAxisAlignment: MainAxisAlignment.center, children: [const Text('Already part of the heritage? ', style: TextStyle(color: AppTheme.textSecondary)), GestureDetector(onTap: () => context.push('/login'), child: const Text('Sign In Here', style: TextStyle(color: AppTheme.primary, fontWeight: FontWeight.w700)))]),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
