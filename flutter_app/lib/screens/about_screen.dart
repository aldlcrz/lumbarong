import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import 'widgets/app_navbar.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Our Story'),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: auth.isLoggedIn ? const [AppNavBarActions()] : null,
      ),
      body: Column(
        children: [
          if (auth.isLoggedIn) const AppNavBar(),
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                children: [
                  Container(
                    height: 200,
                    width: double.infinity,
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: const Icon(
                      Icons.temple_buddhist,
                      size: 80,
                      color: AppTheme.primary,
                    ),
                  ),
                  const SizedBox(height: 32),
                  const Text(
                    'The Heart of Lumban',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'LumBarong was founded with a single mission: to bridge the gap between world-class Lumban artisans and heritage enthusiasts worldwide. We believe that every Barong tells a story of identity, pride, and patience.',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.textSecondary,
                      height: 1.6,
                    ),
                  ),
                  const SizedBox(height: 40),
                  const _MissionItem(
                    icon: Icons.shield_outlined,
                    title: 'Preservation',
                    description:
                        'Keeping the centuries-old "Calado" embroidery alive by giving artisans a digital stage.',
                  ),
                  const SizedBox(height: 24),
                  const _MissionItem(
                    icon: Icons.handshake_outlined,
                    title: 'Fair Trade',
                    description:
                        'Ensuring our local craftsmen receive fair compensation and recognition for their meticulous work.',
                  ),
                  const SizedBox(height: 24),
                  const _MissionItem(
                    icon: Icons.public_outlined,
                    title: 'Global Reach',
                    description:
                        'Bringing the exquisite beauty of Philippine heritage to every corner of the globe.',
                  ),
                  const SizedBox(height: 48),
                  const Divider(),
                  const SizedBox(height: 24),
                  const Text(
                    'LumBarong Heritage Portal v1.0.0',
                    style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Made with pride in the Philippines',
                    style: TextStyle(
                      color: AppTheme.textSecondary,
                      fontStyle: FontStyle.italic,
                      fontSize: 12,
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _MissionItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String description;

  const _MissionItem({
    required this.icon,
    required this.title,
    required this.description,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, color: AppTheme.primary, size: 32),
        const SizedBox(height: 12),
        Text(
          title,
          style: const TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.w900,
            color: AppTheme.textPrimary,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          description,
          textAlign: TextAlign.center,
          style: const TextStyle(
            fontSize: 14,
            color: AppTheme.textSecondary,
            height: 1.5,
          ),
        ),
      ],
    );
  }
}
