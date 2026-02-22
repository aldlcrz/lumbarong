import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../widgets/app_navbar.dart';

class SellerOrdersScreen extends StatefulWidget {
  const SellerOrdersScreen({super.key});

  @override
  State<SellerOrdersScreen> createState() => _SellerOrdersScreenState();
}

class _SellerOrdersScreenState extends State<SellerOrdersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _orders = [];
  bool _loading = true;

  static const _tabs = ['All', 'Processing', 'To Ship', 'Shipped', 'Completed'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: _tabs.length, vsync: this);
    _loadOrders();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadOrders() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/orders');
      if (res.data is List) {
        setState(() {
          _orders = (res.data as List)
              .map((e) => Map<String, dynamic>.from(e as Map))
              .toList();
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  List<Map<String, dynamic>> _filtered(String tabLabel) {
    if (tabLabel == 'All') return _orders;
    return _orders.where((o) {
      final status = (o['status']?.toString() ?? '').toLowerCase();
      final target = tabLabel.toLowerCase();
      if (target == 'processing' &&
          (status == 'pending' || status == 'processing')) {
        return true;
      }
      if (target == 'shipped' &&
          ['shipped', 'to be delivered', 'delivered'].contains(status)) {
        return true;
      }
      return status == target;
    }).toList();
  }

  Future<void> _updateStatus(String orderId, String status) async {
    try {
      await ApiClient().put(
        '/orders/$orderId/status',
        data: {'status': status},
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text('Order marked as $status')));
        await _loadOrders();
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isLoggedIn || auth.user!.role != 'seller') {
      context.go('/');
      return const SizedBox.shrink();
    }
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Order Registry'),
        backgroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          isScrollable: true,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textSecondary,
          indicatorColor: AppTheme.primary,
          tabs: _tabs.map((t) => Tab(text: t)).toList(),
        ),
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
                : TabBarView(
                    controller: _tabController,
                    children: _tabs.map((tab) {
                      final list = _filtered(tab);
                      if (list.isEmpty) {
                        return const Center(
                          child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(
                                Icons.shopping_bag_outlined,
                                size: 60,
                                color: AppTheme.textMuted,
                              ),
                              SizedBox(height: 12),
                              Text(
                                'No orders here',
                                style: TextStyle(color: AppTheme.textSecondary),
                              ),
                            ],
                          ),
                        );
                      }
                      return RefreshIndicator(
                        onRefresh: _loadOrders,
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: list.length,
                          separatorBuilder: (_, _) =>
                              const SizedBox(height: 10),
                          itemBuilder: (ctx, i) => _OrderCard(
                            order: list[i],
                            onUpdateStatus: _updateStatus,
                          ),
                        ),
                      );
                    }).toList(),
                  ),
          ),
        ],
      ),
    );
  }
}

class _OrderCard extends StatelessWidget {
  final Map<String, dynamic> order;
  final void Function(String, String) onUpdateStatus;

  const _OrderCard({required this.order, required this.onUpdateStatus});

  Color _statusColor(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
      case 'processing':
        return const Color(0xFF6C63FF);
      case 'to ship':
        return Colors.indigo;
      case 'shipped':
      case 'to be delivered':
      case 'delivered':
        return Colors.blue;
      case 'completed':
        return const Color(0xFF43BF8E);
      case 'cancelled':
        return Colors.red;
      default:
        return AppTheme.textMuted;
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = order['status']?.toString() ?? 'pending';
    final orderId = order['id']?.toString() ?? '';
    final buyer = (order['buyer'] as Map?) ?? {};
    final items = (order['items'] as List?) ?? [];
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(color: Colors.black.withValues(alpha: 0.04), blurRadius: 6),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Order #${orderId.length > 8 ? orderId.substring(0, 8) : orderId}',
                style: const TextStyle(
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: _statusColor(status).withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  status == 'pending'
                      ? 'PROCESSING'
                      : [
                          'to be delivered',
                          'delivered',
                        ].contains(status.toLowerCase())
                      ? 'SHIPPED'
                      : status.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w800,
                    color: _statusColor(status),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 4),
          Text(
            'Buyer: ${buyer['name'] ?? 'Unknown'}',
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          Text(
            '${items.length} item(s) • ₱${order['totalAmount'] ?? 0}',
            style: const TextStyle(fontSize: 12, color: AppTheme.textSecondary),
          ),
          if (status == 'pending' || status == 'processing') ...[
            const SizedBox(height: 12),
            Row(
              children: [
                if (status == 'pending')
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () => onUpdateStatus(orderId, 'processing'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: const Color(0xFF6C63FF),
                        side: const BorderSide(color: Color(0xFF6C63FF)),
                      ),
                      child: const Text(
                        'Process',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
                if (status == 'processing') ...[
                  const SizedBox(width: 8),
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () => onUpdateStatus(orderId, 'shipped'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.blue,
                        foregroundColor: Colors.white,
                      ),
                      child: const Text(
                        'Mark Shipped',
                        style: TextStyle(fontSize: 12),
                      ),
                    ),
                  ),
                ],
              ],
            ),
          ],
        ],
      ),
    );
  }
}
