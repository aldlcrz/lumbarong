import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../config/app_theme.dart';
import '../models/product.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../services/api_client.dart';
import 'widgets/app_navbar.dart';

class ProductDetailScreen extends StatefulWidget {
  final String productId;

  const ProductDetailScreen({super.key, required this.productId});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  ProductModel? product;
  bool loading = true;
  int quantity = 1;
  bool isWishlisted = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    try {
      final res = await ApiClient().get('/products/${widget.productId}');
      if (res.data is Map) {
        setState(() {
          product = ProductModel.fromJson(
            Map<String, dynamic>.from(res.data as Map),
          );
          loading = false;
        });
        _checkWishlist();
      } else {
        setState(() => loading = false);
      }
    } catch (_) {
      setState(() => loading = false);
    }
  }

  Future<void> _checkWishlist() async {
    if (!context.mounted || context.read<AuthProvider>().user == null) return;
    try {
      final res = await ApiClient().get('/wishlist');
      if (res.data is List) {
        final list = res.data as List;
        final found = list.any(
          (e) => (e as Map)['productId'] == widget.productId,
        );
        if (mounted) setState(() => isWishlisted = found);
      }
    } catch (_) {}
  }

  Future<void> _toggleWishlist() async {
    if (context.read<AuthProvider>().user == null) {
      context.push('/login');
      return;
    }
    try {
      if (isWishlisted) {
        await ApiClient().delete('/wishlist/${widget.productId}');
        setState(() => isWishlisted = false);
      } else {
        await ApiClient().post(
          '/wishlist',
          data: {'productId': widget.productId},
        );
        setState(() => isWishlisted = true);
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final cart = context.watch<CartProvider>();
    if (!auth.isLoggedIn) {
      context.go('/');
      return const SizedBox.shrink();
    }

    if (loading || product == null) {
      return const Scaffold(
        backgroundColor: AppTheme.background,
        appBar: LumBarongAppBar(title: 'Classic Piece', showBack: true),
        body: Center(child: CircularProgressIndicator(color: AppTheme.primary)),
      );
    }

    final p = product!;
    final fmt = NumberFormat.currency(
      locale: 'en_PH',
      symbol: '₱',
      decimalDigits: 0,
    );

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: const LumBarongAppBar(title: 'Heritage Detail', showBack: true),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                ClipRRect(
                  borderRadius: BorderRadius.circular(32),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: CachedNetworkImage(
                      imageUrl: p.imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => Container(
                        color: AppTheme.primary.withValues(alpha: 0.05),
                      ),
                      errorWidget: (context, url, error) => Container(
                        color: AppTheme.primary.withValues(alpha: 0.05),
                        child: const Icon(
                          Icons.broken_image_outlined,
                          size: 48,
                          color: AppTheme.primary,
                        ),
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 16,
                  right: 16,
                  child: GestureDetector(
                    onTap: _toggleWishlist,
                    child: Container(
                      padding: const EdgeInsets.all(12),
                      decoration: const BoxDecoration(
                        color: Colors.white,
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        isWishlisted
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: isWishlisted
                            ? AppTheme.primary
                            : AppTheme.textMuted,
                        size: 24,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 32),
            Row(
              children: [
                if (p.category != null)
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 12,
                      vertical: 6,
                    ),
                    decoration: BoxDecoration(
                      color: AppTheme.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      p.category!.toUpperCase(),
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 1,
                        color: AppTheme.primary,
                      ),
                    ),
                  ),
                const Spacer(),
                if (p.stock < 5)
                  Text(
                    'ONLY ${p.stock} LEFT',
                    style: const TextStyle(
                      color: AppTheme.primary,
                      fontWeight: FontWeight.w900,
                      fontSize: 10,
                      letterSpacing: 1,
                    ),
                  ),
              ],
            ),
            const SizedBox(height: 16),
            Text(
              p.name,
              style: const TextStyle(
                fontSize: 32,
                fontWeight: FontWeight.w900,
                color: AppTheme.textPrimary,
                height: 1.1,
              ),
            ),
            const SizedBox(height: 16),
            Text(
              fmt.format(p.price),
              style: const TextStyle(
                fontSize: 28,
                fontWeight: FontWeight.w900,
                color: AppTheme.primary,
              ),
            ),
            const SizedBox(height: 24),
            if (p.description != null && p.description!.isNotEmpty) ...[
              const Text(
                'THE CRAFTSMANSHIP',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                p.description!,
                style: const TextStyle(
                  fontSize: 15,
                  color: AppTheme.textSecondary,
                  height: 1.7,
                ),
              ),
            ],
            const SizedBox(height: 40),
            if (p.seller != null) ...[
              const Text(
                'CURATED BY',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 1.5,
                  color: AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppTheme.borderLight),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                      child: Text(
                        (p.seller!.shopName ?? p.seller!.name)
                            .substring(0, 1)
                            .toUpperCase(),
                        style: const TextStyle(
                          color: AppTheme.primary,
                          fontWeight: FontWeight.w900,
                        ),
                      ),
                    ),
                    const SizedBox(width: 16),
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          (p.seller!.shopName ?? p.seller!.name).toUpperCase(),
                          style: const TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 13,
                            letterSpacing: 0.5,
                          ),
                        ),
                        const Text(
                          'Authenticated Artisan',
                          style: TextStyle(
                            fontSize: 11,
                            color: AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                    const Spacer(),
                    const Icon(
                      Icons.verified_rounded,
                      color: Color(0xFF10B981),
                      size: 20,
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 100), // Spacing for fab
          ],
        ),
      ),
      bottomNavigationBar: Container(
        padding: const EdgeInsets.all(24),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 10,
              offset: const Offset(0, -4),
            ),
          ],
        ),
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                color: AppTheme.background,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: quantity > 1
                        ? () => setState(() => quantity--)
                        : null,
                    icon: const Icon(Icons.remove_rounded),
                  ),
                  Text(
                    '$quantity',
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                    ),
                  ),
                  IconButton(
                    onPressed: quantity < p.stock
                        ? () => setState(() => quantity++)
                        : null,
                    icon: const Icon(Icons.add_rounded),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: ElevatedButton(
                onPressed: () {
                  cart.addToCart(p, quantity);
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('Added to your collection'),
                      behavior: SnackBarBehavior.floating,
                      backgroundColor: AppTheme.darkSection,
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppTheme.primary,
                  padding: const EdgeInsets.symmetric(vertical: 18),
                ),
                child: const Text(
                  'ADD TO CART',
                  style: TextStyle(
                    letterSpacing: 1.5,
                    fontWeight: FontWeight.w900,
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
