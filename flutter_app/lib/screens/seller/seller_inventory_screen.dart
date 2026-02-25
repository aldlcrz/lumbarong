import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../widgets/app_navbar.dart';

class SellerInventoryScreen extends StatefulWidget {
  const SellerInventoryScreen({super.key});

  @override
  State<SellerInventoryScreen> createState() => _SellerInventoryScreenState();
}

class _SellerInventoryScreenState extends State<SellerInventoryScreen> {
  List<Map<String, dynamic>> _products = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadProducts();
  }

  Future<void> _loadProducts() async {
    setState(() => _loading = true);
    try {
      final auth = context.read<AuthProvider>();
      final sellerId = auth.user?.id;
      final res = await ApiClient().get(
        '/products',
        queryParameters: {'shop': sellerId},
      );
      if (res.data is List) {
        setState(() {
          _products = (res.data as List)
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _updateStock(String productId, int newStock) async {
    try {
      await ApiClient().patch(
        '/products/$productId/stock',
        data: {'stock': newStock},
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Stock updated')));
        await _loadProducts();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Failed to update stock')));
      }
    }
  }

  void _showEditStockDialog(Map<String, dynamic> product) {
    final controller = TextEditingController(text: '${product['stock'] ?? 0}');
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Update Stock: ${product['name']}'),
        content: TextField(
          controller: controller,
          keyboardType: TextInputType.number,
          decoration: const InputDecoration(labelText: 'New Stock Quantity'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () {
              final newStock = int.tryParse(controller.text);
              if (newStock != null && newStock >= 0) {
                Navigator.pop(context);
                _updateStock(product['id'].toString(), newStock);
              }
            },
            child: const Text('Update'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isLoggedIn || auth.user!.role != 'seller') {
      context.go('/');
      return const SizedBox.shrink();
    }

    final lowStock = _products
        .where((p) => (p['stock'] as int? ?? 0) <= 5)
        .toList();
    final inStock = _products
        .where((p) => (p['stock'] as int? ?? 0) > 5)
        .toList();

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Inventory'),
        backgroundColor: Colors.white,
        elevation: 0,
        actions: const [AppNavBarActions()],
      ),
      body: Column(
        children: [
          const AppNavBar(),
          Expanded(
            child: _loading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary),
                  )
                : RefreshIndicator(
                    onRefresh: _loadProducts,
                    child: SingleChildScrollView(
                      physics: const AlwaysScrollableScrollPhysics(),
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (lowStock.isNotEmpty) ...[
                            Row(
                              children: [
                                const Icon(
                                  Icons.warning_amber,
                                  color: Colors.orange,
                                  size: 18,
                                ),
                                const SizedBox(width: 6),
                                Text(
                                  'Low Stock (${lowStock.length})',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                    color: Colors.orange,
                                    fontSize: 14,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            ...lowStock.map(
                              (p) => _InventoryTile(
                                product: p,
                                isLowStock: true,
                                onEdit: _showEditStockDialog,
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          if (inStock.isNotEmpty) ...[
                            Text(
                              'In Stock (${inStock.length})',
                              style: const TextStyle(
                                fontWeight: FontWeight.w800,
                                color: AppTheme.textPrimary,
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 8),
                            ...inStock.map(
                              (p) => _InventoryTile(
                                product: p,
                                isLowStock: false,
                                onEdit: _showEditStockDialog,
                              ),
                            ),
                          ],
                          if (_products.isEmpty)
                            const Center(
                              child: Padding(
                                padding: EdgeInsets.only(top: 60),
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.inventory_2,
                                      size: 60,
                                      color: AppTheme.textMuted,
                                    ),
                                    SizedBox(height: 12),
                                    Text(
                                      'No products in inventory',
                                      style: TextStyle(
                                        color: AppTheme.textSecondary,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}

class _InventoryTile extends StatelessWidget {
  final Map<String, dynamic> product;
  final bool isLowStock;
  final void Function(Map<String, dynamic>) onEdit;

  const _InventoryTile({
    required this.product,
    required this.isLowStock,
    required this.onEdit,
  });

  @override
  Widget build(BuildContext context) {
    final stock = product['stock'] as int? ?? 0;
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: isLowStock
            ? Border.all(color: Colors.orange.withValues(alpha: 0.4))
            : null,
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6),
        ],
      ),
      child: Row(
        children: [
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  product['name']?.toString() ?? '',
                  style: const TextStyle(
                    fontWeight: FontWeight.w700,
                    color: AppTheme.textPrimary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
                Text(
                  '₱${product['price']} • ${product['category'] ?? 'Uncategorized'}',
                  style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.textSecondary,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
            decoration: BoxDecoration(
              color: isLowStock
                  ? Colors.orange.withValues(alpha: 0.1)
                  : const Color(0xFF43BF8E).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '$stock left',
              style: TextStyle(
                fontWeight: FontWeight.w800,
                fontSize: 13,
                color: isLowStock ? Colors.orange : const Color(0xFF43BF8E),
              ),
            ),
          ),
          const SizedBox(width: 8),
          IconButton(
            icon: const Icon(Icons.edit_outlined, size: 20),
            onPressed: () => onEdit(product),
          ),
        ],
      ),
    );
  }
}
