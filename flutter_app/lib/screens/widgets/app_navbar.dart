import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../providers/cart_provider.dart';

class AppNavBar extends StatelessWidget {
  const AppNavBar({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user!;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      color: Colors.white,
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: [
            if (user.role == 'customer') ...[
              _NavLink(
                label: 'Heritage Mall',
                onTap: () => context.go('/home'),
              ),
              _NavLink(
                label: 'My Orders',
                onTap: () => context.push('/orders'),
              ),
              _NavLink(
                label: 'Messages',
                onTap: () => context.push('/messages'),
              ),
              _NavLink(
                label: 'Heritage Guide',
                onTap: () => context.push('/heritage-guide'),
              ),
            ],
            if (user.role == 'seller') ...[
              _NavLink(
                label: 'Shop Board',
                onTap: () => context.go('/seller/dashboard'),
              ),
              _NavLink(
                label: 'Order Registry',
                onTap: () => context.push('/seller/orders'),
              ),
              _NavLink(
                label: 'Messages',
                onTap: () => context.push('/messages'),
              ),
              _NavLink(
                label: 'Inventory',
                onTap: () => context.push('/seller/inventory'),
              ),
            ],
            if (user.role == 'admin') ...[
              _NavLink(
                label: 'Admin Console',
                onTap: () => context.go('/admin/dashboard'),
              ),
              _NavLink(
                label: 'Manage Sellers',
                onTap: () => context.push('/admin/sellers'),
              ),
              _NavLink(
                label: 'Products',
                onTap: () => context.push('/admin/products'),
              ),
              _NavLink(
                label: 'Settings',
                onTap: () => context.push('/admin/settings'),
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _NavLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;

  const _NavLink({required this.label, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: TextButton(
        onPressed: onTap,
        child: Text(
          label,
          style: const TextStyle(
            fontWeight: FontWeight.w700,
            color: AppTheme.textSecondary,
          ),
        ),
      ),
    );
  }
}

class AppNavBarActions extends StatelessWidget {
  const AppNavBarActions({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user!;
    final cart = context.watch<CartProvider>();
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        if (user.role == 'customer') ...[
          IconButton(
            icon: Badge(
              label: Text('${cart.cartCount}'),
              isLabelVisible: cart.cartCount > 0,
              child: const Icon(Icons.shopping_cart),
            ),
            onPressed: () => context.push('/cart'),
          ),
        ],
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8),
          child: Text(
            user.name.split(' ').first,
            style: const TextStyle(
              fontSize: 12,
              fontWeight: FontWeight.w700,
              color: AppTheme.textPrimary,
            ),
          ),
        ),
        IconButton(
          icon: const Icon(Icons.logout, size: 20),
          onPressed: () async {
            await auth.logout();
            if (context.mounted) context.go('/');
          },
        ),
      ],
    );
  }
}
