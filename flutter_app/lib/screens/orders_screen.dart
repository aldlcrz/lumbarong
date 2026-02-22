import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../config/app_theme.dart';
import '../models/order.dart';
import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import 'widgets/app_navbar.dart';

class OrdersScreen extends StatefulWidget {
  const OrdersScreen({super.key});

  @override
  State<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends State<OrdersScreen> {
  List<OrderModel> orders = [];
  bool loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => loading = true);
    try {
      final res = await ApiClient().get('/orders');
      if (res.data is List) {
        setState(() {
          orders = (res.data as List)
              .map(
                (e) => OrderModel.fromJson(Map<String, dynamic>.from(e as Map)),
              )
              .toList();
          loading = false;
        });
      } else {
        setState(() => loading = false);
      }
    } catch (_) {
      setState(() => loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isLoggedIn) {
      context.go('/');
      return const SizedBox.shrink();
    }
    final fmt = NumberFormat.currency(
      locale: 'en_PH',
      symbol: '₱',
      decimalDigits: 0,
    );
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('My Orders'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        actions: const [AppNavBarActions()],
      ),
      body: Column(
        children: [
          const AppNavBar(),
          Expanded(
            child: loading
                ? const Center(
                    child: CircularProgressIndicator(color: AppTheme.primary),
                  )
                : orders.isEmpty
                ? const Center(
                    child: Text(
                      'No orders yet.',
                      style: TextStyle(color: AppTheme.textSecondary),
                    ),
                  )
                : Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 800),
                      child: RefreshIndicator(
                        onRefresh: _load,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(24),
                          itemCount: orders.length,
                          itemBuilder: (_, i) {
                            final o = orders[i];
                            final shortId = o.id.length >= 8
                                ? o.id.substring(0, 8)
                                : o.id;
                            return Card(
                              margin: const EdgeInsets.only(bottom: 16),
                              child: ListTile(
                                title: Text(
                                  'Order $shortId...',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                                subtitle: Text(
                                  '${o.status == 'Pending'
                                      ? 'Processing'
                                      : ['To Be Delivered', 'Delivered'].contains(o.status)
                                      ? 'Shipped'
                                      : o.status} · ${fmt.format(o.totalAmount)}',
                                ),
                                trailing: const Icon(Icons.chevron_right),
                                onTap: () {},
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  ),
          ),
        ],
      ),
    );
  }
}
