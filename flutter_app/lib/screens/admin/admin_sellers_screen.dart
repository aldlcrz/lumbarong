import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../widgets/app_navbar.dart';

class AdminSellersScreen extends StatefulWidget {
  const AdminSellersScreen({super.key});

  @override
  State<AdminSellersScreen> createState() => _AdminSellersScreenState();
}

class _AdminSellersScreenState extends State<AdminSellersScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  List<Map<String, dynamic>> _pending = [];
  List<Map<String, dynamic>> _verified = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadSellers();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadSellers() async {
    setState(() => _loading = true);
    try {
      final res = await ApiClient().get('/auth/sellers');
      if (res.data is List) {
        final all = (res.data as List)
            .map((e) => Map<String, dynamic>.from(e as Map))
            .toList();
        setState(() {
          _pending = all.where((s) => s['isVerified'] == false).toList();
          _verified = all.where((s) => s['isVerified'] == true).toList();
        });
      }
    } catch (_) {}
    setState(() => _loading = false);
  }

  Future<void> _approveSeller(String id) async {
    try {
      await ApiClient().put('/auth/approve-seller/$id');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Seller approved successfully')),
        );
        await _loadSellers();
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Failed to approve seller')),
        );
      }
    }
  }

  Future<void> _revokeSeller(String id) async {
    try {
      await ApiClient().put('/auth/revoke-seller/$id');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Seller verification revoked')),
        );
        await _loadSellers();
      }
    } catch (_) {}
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isLoggedIn || auth.user!.role != 'admin') {
      context.go('/');
      return const SizedBox.shrink();
    }
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Manage Sellers'),
        backgroundColor: Colors.white,
        elevation: 0,
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppTheme.primary,
          unselectedLabelColor: AppTheme.textSecondary,
          indicatorColor: AppTheme.primary,
          tabs: [
            Tab(text: 'Pending (${_pending.length})'),
            Tab(text: 'Verified (${_verified.length})'),
          ],
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
                    children: [
                      _SellerList(
                        sellers: _pending,
                        onApprove: _approveSeller,
                        showApprove: true,
                      ),
                      _SellerList(
                        sellers: _verified,
                        onRevoke: _revokeSeller,
                        showRevoke: true,
                      ),
                    ],
                  ),
          ),
        ],
      ),
    );
  }
}

class _SellerList extends StatelessWidget {
  final List<Map<String, dynamic>> sellers;
  final bool showApprove;
  final bool showRevoke;
  final void Function(String)? onApprove;
  final void Function(String)? onRevoke;

  const _SellerList({
    required this.sellers,
    this.showApprove = false,
    this.showRevoke = false,
    this.onApprove,
    this.onRevoke,
  });

  @override
  Widget build(BuildContext context) {
    if (sellers.isEmpty) {
      return const Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.store_mall_directory,
              size: 60,
              color: AppTheme.textMuted,
            ),
            SizedBox(height: 12),
            Text(
              'No sellers here',
              style: TextStyle(color: AppTheme.textSecondary),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: () async {},
      child: ListView.separated(
        padding: const EdgeInsets.all(16),
        itemCount: sellers.length,
        separatorBuilder: (_, __) => const SizedBox(height: 12),
        itemBuilder: (context, i) {
          final s = sellers[i];
          return Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: AppTheme.primary.withValues(alpha: 0.1),
                  child: Text(
                    (s['name']?.toString() ?? '?')
                        .substring(0, 1)
                        .toUpperCase(),
                    style: const TextStyle(
                      fontWeight: FontWeight.w900,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        s['shopName']?.toString() ??
                            s['name']?.toString() ??
                            'Unknown',
                        style: const TextStyle(
                          fontWeight: FontWeight.w700,
                          color: AppTheme.textPrimary,
                        ),
                      ),
                      Text(
                        s['email']?.toString() ?? '',
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textSecondary,
                        ),
                      ),
                    ],
                  ),
                ),
                if (showApprove)
                  ElevatedButton(
                    onPressed: () => onApprove?.call(s['id'].toString()),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF43BF8E),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      textStyle: const TextStyle(fontSize: 12),
                    ),
                    child: const Text('Approve'),
                  ),
                if (showRevoke)
                  OutlinedButton(
                    onPressed: () => onRevoke?.call(s['id'].toString()),
                    style: OutlinedButton.styleFrom(
                      foregroundColor: AppTheme.primary,
                      side: BorderSide(
                        color: AppTheme.primary.withValues(alpha: 0.5),
                      ),
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 8,
                      ),
                      textStyle: const TextStyle(fontSize: 12),
                    ),
                    child: const Text('Revoke'),
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
