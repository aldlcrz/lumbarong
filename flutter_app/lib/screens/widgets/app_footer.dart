import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../config/app_theme.dart';

class AppFooter extends StatelessWidget {
  const AppFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: const BoxDecoration(
        color: Colors.white,
        border: Border(top: BorderSide(color: Color(0xFFF3F4F6))),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('LumBarong', style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900, fontStyle: FontStyle.italic, color: AppTheme.primary)),
          const SizedBox(height: 16),
          const Text('The premiere marketplace for authentic Filipino heritage. Connecting world-class artisans to the global stage.', style: TextStyle(color: AppTheme.textMuted, fontSize: 14)),
          const SizedBox(height: 24),
          Wrap(
            spacing: 24,
            runSpacing: 8,
            children: [
              _FooterLink(label: 'Artisan Catalog', onTap: () => context.go('/home')),
              _FooterLink(label: 'Heritage Guide', onTap: () => context.push('/heritage-guide')),
              _FooterLink(label: 'Our Story', onTap: () => context.push('/about')),
            ],
          ),
          const SizedBox(height: 24),
          Text('© ${DateTime.now().year} LumBarong Philippines', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.w800, color: AppTheme.textMuted)),
        ],
      ),
    );
  }
}

class _FooterLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _FooterLink({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700, color: AppTheme.textSecondary)),
    );
  }
}
