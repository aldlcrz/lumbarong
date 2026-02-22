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
  String? _selectedSize;
  String? _selectedColor;

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
          if (product!.availableSizes != null &&
              product!.availableSizes!.isNotEmpty) {
            _selectedSize = product!.availableSizes!.first;
          }
          if (product!.availableColors != null &&
              product!.availableColors!.isNotEmpty) {
            _selectedColor = product!.availableColors!.first;
          }
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
      return Scaffold(
        backgroundColor: AppTheme.background,
        appBar: AppBar(
          title: const Text('Product'),
          leading: IconButton(
            icon: const Icon(Icons.arrow_back),
            onPressed: () => context.pop(),
          ),
        ),
        body: const Center(
          child: CircularProgressIndicator(color: AppTheme.primary),
        ),
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
      appBar: AppBar(
        title: const Text(
          'LumBarong',
          style: TextStyle(
            fontWeight: FontWeight.w900,
            fontStyle: FontStyle.italic,
            color: AppTheme.primary,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: const [AppNavBarActions()],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1200),
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            child: LayoutBuilder(
              builder: (context, constraints) {
                final bool isOwner =
                    auth.user != null && p.sellerId == auth.user!.id;

                final imageWidget = ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: AspectRatio(
                    aspectRatio: 1,
                    child: CachedNetworkImage(
                      imageUrl: p.imageUrl,
                      fit: BoxFit.cover,
                      placeholder: (context, url) => const ColoredBox(
                        color: Color(0xFFF3F4F6),
                        child: Center(
                          child: CircularProgressIndicator(
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                      errorWidget: (context, url, error) => const ColoredBox(
                        color: Color(0xFFF3F4F6),
                        child: Icon(Icons.image_not_supported, size: 48),
                      ),
                    ),
                  ),
                );

                final detailsWidget = Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (isOwner)
                      Container(
                        width: double.infinity,
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.symmetric(
                          vertical: 10,
                          horizontal: 16,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.amber.shade50,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: Colors.amber.shade200),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.shield_outlined,
                              color: Colors.amber.shade800,
                              size: 20,
                            ),
                            const SizedBox(width: 10),
                            Text(
                              'ARTISAN PREVIEW MODE',
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w900,
                                color: Colors.amber.shade900,
                                letterSpacing: 0.5,
                              ),
                            ),
                          ],
                        ),
                      ),
                    Row(
                      children: [
                        if (p.category != null)
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              p.category!,
                              style: const TextStyle(
                                fontSize: 10,
                                fontWeight: FontWeight.w800,
                                color: AppTheme.primary,
                              ),
                            ),
                          ),
                        const Spacer(),
                        IconButton(
                          onPressed: _toggleWishlist,
                          icon: Icon(
                            isWishlisted
                                ? Icons.favorite
                                : Icons.favorite_border,
                            color: isWishlisted ? AppTheme.primary : null,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(
                      p.name,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w900,
                        color: AppTheme.textPrimary,
                      ),
                    ),
                    if (p.description != null && p.description!.isNotEmpty)
                      Text(
                        p.description!,
                        style: const TextStyle(
                          fontSize: 14,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        const Text(
                          'Artisan Price',
                          style: TextStyle(
                            fontSize: 10,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          fmt.format(p.price),
                          style: const TextStyle(
                            fontSize: 24,
                            fontWeight: FontWeight.w900,
                            color: AppTheme.primary,
                          ),
                        ),
                      ],
                    ),
                    if (p.seller != null)
                      Padding(
                        padding: const EdgeInsets.only(top: 8),
                        child: Text(
                          'Sold by ${p.seller!.shopName ?? p.seller!.name}',
                          style: const TextStyle(
                            fontSize: 12,
                            color: AppTheme.textSecondary,
                          ),
                        ),
                      ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.amber.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.amber.shade100),
                      ),
                      child: Row(
                        children: [
                          Icon(
                            Icons.access_time,
                            size: 16,
                            color: Colors.amber.shade800,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Production: ${p.leadTime} Days',
                            style: TextStyle(
                              fontSize: 12,
                              fontWeight: FontWeight.w800,
                              color: Colors.amber.shade900,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    if (p.availableColors != null &&
                        p.availableColors!.isNotEmpty) ...[
                      const Text(
                        'SELECT COLOR',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        children: p.availableColors!.map((c) {
                          final isSelected = _selectedColor == c;
                          return ChoiceChip(
                            label: Text(
                              c,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected
                                    ? FontWeight.w900
                                    : FontWeight.w500,
                              ),
                            ),
                            selected: isSelected,
                            onSelected: (val) =>
                                setState(() => _selectedColor = c),
                            selectedColor: AppTheme.primary,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : Colors.black87,
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (p.availableSizes != null &&
                        p.availableSizes!.isNotEmpty) ...[
                      const Text(
                        'SELECT SIZE',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w800,
                          color: AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 10),
                      Wrap(
                        spacing: 8,
                        children: p.availableSizes!.map((s) {
                          final isSelected = _selectedSize == s;
                          return ChoiceChip(
                            label: Text(
                              s,
                              style: TextStyle(
                                fontSize: 12,
                                fontWeight: isSelected
                                    ? FontWeight.w900
                                    : FontWeight.w500,
                              ),
                            ),
                            selected: isSelected,
                            onSelected: (val) =>
                                setState(() => _selectedSize = s),
                            selectedColor: AppTheme.primary,
                            labelStyle: TextStyle(
                              color: isSelected ? Colors.white : Colors.black87,
                            ),
                          );
                        }).toList(),
                      ),
                      const SizedBox(height: 16),
                    ],
                    if (!isOwner) ...[
                      Row(
                        children: [
                          const Text(
                            'Quantity',
                            style: TextStyle(fontWeight: FontWeight.w700),
                          ),
                          const SizedBox(width: 16),
                          Row(
                            children: [
                              IconButton(
                                onPressed: quantity > 1
                                    ? () => setState(() => quantity--)
                                    : null,
                                icon: const Icon(Icons.remove_circle_outline),
                              ),
                              Padding(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 16,
                                ),
                                child: Text(
                                  '$quantity',
                                  style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ),
                              IconButton(
                                onPressed: quantity < (p.stock)
                                    ? () => setState(() => quantity++)
                                    : null,
                                icon: const Icon(Icons.add_circle_outline),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                    const SizedBox(height: 24),
                    SizedBox(
                      width: double.infinity,
                      height: 56,
                      child: ElevatedButton(
                        style: isOwner
                            ? ElevatedButton.styleFrom(
                                backgroundColor: Colors.white,
                                foregroundColor: AppTheme.primary,
                                side: const BorderSide(color: AppTheme.primary),
                              )
                            : null,
                        onPressed: isOwner
                            ? () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text(
                                      'Edit functionality coming soon to the artisan workshop!',
                                    ),
                                  ),
                                );
                              }
                            : () {
                                cart.addToCart(p, quantity);
                                ScaffoldMessenger.of(context).showSnackBar(
                                  const SnackBar(
                                    content: Text('Added to cart'),
                                  ),
                                );
                              },
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              isOwner
                                  ? Icons.edit_outlined
                                  : Icons.shopping_cart,
                            ),
                            const SizedBox(width: 8),
                            Text(isOwner ? 'Edit Masterpiece' : 'Add to Cart'),
                          ],
                        ),
                      ),
                    ),
                  ],
                );

                if (constraints.maxWidth > 800) {
                  return Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(flex: 5, child: imageWidget),
                      const SizedBox(width: 48),
                      Expanded(flex: 7, child: detailsWidget),
                    ],
                  );
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    imageWidget,
                    const SizedBox(height: 24),
                    detailsWidget,
                  ],
                );
              },
            ),
          ),
        ),
      ),
    );
  }
}
