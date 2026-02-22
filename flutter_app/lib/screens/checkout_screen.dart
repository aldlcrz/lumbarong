// ignore_for_file: deprecated_member_use
import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../config/app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/cart_provider.dart';
import '../services/api_client.dart';
import 'widgets/app_navbar.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  final _phoneController = TextEditingController();
  final _addressController = TextEditingController();
  String _paymentMethod = 'GCash';
  final _referenceController = TextEditingController();
  String? _receiptImageUrl;
  File? _receiptFile;
  bool _isOrdering = false;
  bool _orderComplete = false;

  @override
  void dispose() {
    _phoneController.dispose();
    _addressController.dispose();
    _referenceController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final x = await picker.pickImage(source: ImageSource.gallery);
    if (x == null) return;
    setState(() => _receiptFile = File(x.path));
    try {
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(x.path, filename: 'receipt.jpg'),
      });
      final res = await ApiClient().postMultipart('/upload', data: formData);
      if (res.data is Map && (res.data as Map)['url'] != null) {
        setState(() => _receiptImageUrl = (res.data as Map)['url'].toString());
      }
    } catch (_) {}
  }

  Future<void> _submitOrder() async {
    if (_addressController.text.trim().isEmpty ||
        _phoneController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please complete shipping details.')),
      );
      return;
    }
    if (_paymentMethod == 'GCash' && _referenceController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Please enter your GCash reference number.'),
        ),
      );
      return;
    }
    final cart = context.read<CartProvider>();
    if (cart.items.isEmpty) {
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('Cart is empty.')));
      return;
    }
    setState(() => _isOrdering = true);
    try {
      final orderData = {
        'items': cart.items
            .map(
              (i) => {
                'product': i.product.id,
                'quantity': i.quantity,
                'price': i.product.price,
              },
            )
            .toList(),
        'totalAmount': cart.cartTotal,
        'paymentMethod': _paymentMethod,
        'shippingAddress':
            '${_addressController.text.trim()} | Contact: ${_phoneController.text.trim()}',
        'referenceNumber': _paymentMethod == 'GCash'
            ? _referenceController.text.trim()
            : null,
        'receiptImage': _paymentMethod == 'GCash' ? _receiptImageUrl : null,
      };
      await ApiClient().post('/orders', data: orderData);
      if (!mounted) return;
      context.read<CartProvider>().clearCart();
      setState(() {
        _orderComplete = true;
        _isOrdering = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Order placed successfully!')),
        );
      }
    } catch (e) {
      setState(() => _isOrdering = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Order failed: ${e.toString()}')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final cart = context.watch<CartProvider>();
    if (!auth.isLoggedIn) {
      context.go('/');
      return const SizedBox.shrink();
    }
    if (cart.items.isEmpty && !_orderComplete) {
      context.go('/home');
      return const SizedBox.shrink();
    }
    if (_orderComplete) {
      return Scaffold(
        backgroundColor: AppTheme.background,
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(32),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.check_circle, size: 80, color: AppTheme.primary),
                const SizedBox(height: 24),
                const Text(
                  'Order Placed!',
                  style: TextStyle(fontSize: 28, fontWeight: FontWeight.w900),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => context.go('/orders'),
                  child: const Text('View Orders'),
                ),
              ],
            ),
          ),
        ),
      );
    }
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Checkout'),
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
            child: Center(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 600),
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      TextFormField(
                        controller: _phoneController,
                        decoration: const InputDecoration(
                          labelText: 'Contact Phone',
                          hintText: '09xx-xxx-xxxx',
                        ),
                        keyboardType: TextInputType.phone,
                      ),
                      const SizedBox(height: 16),
                      TextFormField(
                        controller: _addressController,
                        decoration: const InputDecoration(
                          labelText: 'Shipping Address',
                        ),
                        maxLines: 2,
                      ),
                      const SizedBox(height: 24),
                      const Text(
                        'Payment',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                        ),
                      ),
                      RadioListTile<String>(
                        title: const Text('GCash'),
                        value: 'GCash',
                        groupValue: _paymentMethod,
                        onChanged: (v) => setState(() => _paymentMethod = v!),
                      ),
                      RadioListTile<String>(
                        title: const Text('COD'),
                        value: 'COD',
                        groupValue: _paymentMethod,
                        onChanged: (v) => setState(() => _paymentMethod = v!),
                      ),
                      if (_paymentMethod == 'GCash') ...[
                        // Seller GCash Details (Showing for the first item's seller in cart)
                        if (cart.items.isNotEmpty &&
                            cart.items.first.product.seller != null) ...[
                          Container(
                            margin: const EdgeInsets.only(bottom: 24),
                            padding: const EdgeInsets.all(20),
                            decoration: BoxDecoration(
                              color: Colors.blue.withValues(alpha: 0.05),
                              borderRadius: BorderRadius.circular(20),
                              border: Border.all(
                                color: Colors.blue.withValues(alpha: 0.1),
                              ),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.stretch,
                              children: [
                                const Text(
                                  'ARTISAN GCASH SETTLEMENT',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.w900,
                                    letterSpacing: 1.2,
                                    color: Colors.blue,
                                  ),
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  mainAxisAlignment:
                                      MainAxisAlignment.spaceBetween,
                                  children: [
                                    const Text(
                                      'Pay to Artisan:',
                                      style: TextStyle(
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    Text(
                                      cart
                                              .items
                                              .first
                                              .product
                                              .seller!
                                              .gcashNumber ??
                                          'N/A',
                                      style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.w900,
                                        color: Colors.black87,
                                      ),
                                    ),
                                  ],
                                ),
                                if (cart
                                        .items
                                        .first
                                        .product
                                        .seller!
                                        .gcashQrCode !=
                                    null) ...[
                                  const SizedBox(height: 16),
                                  const Text(
                                    'Scan QR to Pay:',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w900,
                                      color: Colors.grey,
                                    ),
                                    textAlign: TextAlign.center,
                                  ),
                                  const SizedBox(height: 8),
                                  Center(
                                    child: ClipRRect(
                                      borderRadius: BorderRadius.circular(12),
                                      child: Image.network(
                                        cart
                                            .items
                                            .first
                                            .product
                                            .seller!
                                            .gcashQrCode!,
                                        height: 150,
                                        width: 150,
                                        fit: BoxFit.cover,
                                        errorBuilder: (c, e, s) => const Icon(
                                          Icons.qr_code,
                                          size: 60,
                                          color: Colors.grey,
                                        ),
                                      ),
                                    ),
                                  ),
                                ],
                              ],
                            ),
                          ),
                        ],
                        TextFormField(
                          controller: _referenceController,
                          decoration: const InputDecoration(
                            labelText: 'Reference Number',
                            hintText: 'Enter 13-digit Gcash Reference',
                          ),
                        ),
                        const SizedBox(height: 16),
                        OutlinedButton.icon(
                          onPressed: _pickImage,
                          icon: const Icon(Icons.upload),
                          label: Text(
                            _receiptFile != null
                                ? 'Receipt selected'
                                : 'Upload receipt image',
                          ),
                        ),
                      ],
                      const SizedBox(height: 32),
                      SizedBox(
                        height: 56,
                        child: ElevatedButton(
                          onPressed: _isOrdering ? null : _submitOrder,
                          child: _isOrdering
                              ? const SizedBox(
                                  height: 24,
                                  width: 24,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    color: Colors.white,
                                  ),
                                )
                              : const Text('Place Order'),
                        ),
                      ),
                    ],
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
