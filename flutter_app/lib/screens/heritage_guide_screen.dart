import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import 'widgets/app_navbar.dart';

class HeritageGuideScreen extends StatelessWidget {
  const HeritageGuideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Heritage Guide'),
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'The Art of Lumban Embroidery',
                    style: TextStyle(
                      fontSize: 28,
                      fontWeight: FontWeight.w900,
                      color: AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Discover the traditions behind every stitch, preserving centuries of Filipino craftsmanship.',
                    style: TextStyle(
                      fontSize: 16,
                      color: AppTheme.textSecondary,
                    ),
                  ),
                  const SizedBox(height: 32),
                  _GuideSection(
                    title: 'The Calado Technique',
                    description:
                        'A signature of Lumban, Calado involves meticulously pulling threads from the fabric to create intricate lace-like patterns. It requires extreme precision and months of labor.',
                    icon: Icons.auto_awesome,
                    color: AppTheme.primary,
                  ),
                  const SizedBox(height: 16),
                  _GuideSection(
                    title: 'The Piña Fabric',
                    description:
                        'Known as the "Queen of Philippine Fabrics," Piña is woven from fine pineapple fibers. It is prized for its translucent luster and delicate texture, traditionally used for high-end Barongs.',
                    icon: Icons.grass,
                    color: const Color(0xFF43BF8E),
                  ),
                  const SizedBox(height: 16),
                  _GuideSection(
                    title: 'Jusi & Banana Fiber',
                    description:
                        'Jusi is a mechanically woven fabric traditionally made from banana skins. It is more durable than Piña while maintaining a regal appearance, making it perfect for various heritage garments.',
                    icon: Icons.workspace_premium,
                    color: const Color(0xFF6C63FF),
                  ),
                  const SizedBox(height: 32),
                  Container(
                    padding: const EdgeInsets.all(24),
                    decoration: BoxDecoration(
                      color: AppTheme.darkSection,
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Column(
                      children: [
                        Icon(Icons.history_edu, color: Colors.white, size: 40),
                        SizedBox(height: 16),
                        Text(
                          'Preserving the legacy',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 20,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        SizedBox(height: 8),
                        Text(
                          'By supporting LumBarong, you directly contribute to the livelihood of traditional embroiderers in Lumban, Laguna, ensuring this art form survives for future generations.',
                          textAlign: TextAlign.center,
                          style: TextStyle(color: Colors.white70, height: 1.5),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _GuideSection extends StatelessWidget {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  const _GuideSection({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 10,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w900,
                    color: AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: const TextStyle(
                    fontSize: 14,
                    color: AppTheme.textSecondary,
                    height: 1.5,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
