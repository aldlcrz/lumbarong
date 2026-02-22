import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart' as dio;
import '../../config/app_theme.dart';
import '../../providers/auth_provider.dart';
import '../../services/api_client.dart';
import '../widgets/app_navbar.dart';

class AddProductScreen extends StatefulWidget {
  const AddProductScreen({super.key});

  @override
  State<AddProductScreen> createState() => _AddProductScreenState();
}

class _AddProductScreenState extends State<AddProductScreen> {
  final _formKey = GlobalKey<FormState>();
  final _nameCtrl = TextEditingController();
  final _descCtrl = TextEditingController();
  final _priceCtrl = TextEditingController();
  final _stockCtrl = TextEditingController();
  String _category = 'Barong Tagalog';
  final List<String> _images = [];
  bool _isLoading = false;
  bool _isUploading = false;
  String? _error;

  static const _categories = [
    'Barong Tagalog',
    'Filipiniana Dresses',
    'Accessories',
    'Others',
  ];

  @override
  void dispose() {
    _nameCtrl.dispose();
    _descCtrl.dispose();
    _priceCtrl.dispose();
    _stockCtrl.dispose();
    super.dispose();
  }

  Future<void> _pickAndUploadImage() async {
    if (_images.length >= 5) {
      setState(() => _error = 'Maximum 5 photos allowed per masterpiece.');
      return;
    }

    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );

    if (image == null) return;

    setState(() {
      _isUploading = true;
      _error = null;
    });

    try {
      final fileName = image.name;
      final formData = dio.FormData.fromMap({
        'image': await dio.MultipartFile.fromFile(
          image.path,
          filename: fileName,
        ),
      });

      final res = await ApiClient().postMultipart('/upload', data: formData);

      if (res.data != null && res.data['url'] != null) {
        setState(() {
          _images.add(res.data['url']);
        });
      }
    } catch (e) {
      setState(() => _error = 'Image upload failed. Please try again.');
    } finally {
      setState(() => _isUploading = false);
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    if (_images.length < 3) {
      setState(
        () => _error =
            'Wait! At least 3 photos (Front, Back, Side) are required to showcase heritage details.',
      );
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    try {
      await ApiClient().post(
        '/products',
        data: {
          'name': _nameCtrl.text.trim(),
          'description': _descCtrl.text.trim(),
          'price': double.tryParse(_priceCtrl.text) ?? 0,
          'stock': int.tryParse(_stockCtrl.text) ?? 0,
          'category': _category,
          'images': _images,
        },
      );
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Your masterpiece is now live in the collection!'),
            backgroundColor: Color(0xFF43BF8E),
          ),
        );
        context.pop();
      }
    } catch (e) {
      setState(
        () => _error =
            'Failed to showcase product. Please check your connection.',
      );
    }
    setState(() => _isLoading = false);
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    if (!auth.isLoggedIn ||
        (auth.user!.role != 'seller' && auth.user!.role != 'admin')) {
      context.go('/');
      return const SizedBox.shrink();
    }

    final angleLabels = [
      'Front View',
      'Back View',
      'Side View',
      'Detail 1',
      'Detail 2',
    ];

    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: AppBar(
        title: const Text('Publish Masterpiece'),
        backgroundColor: Colors.white,
        elevation: 0,
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
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    if (_error != null)
                      Container(
                        margin: const EdgeInsets.only(bottom: 20),
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: Colors.red.withValues(alpha: 0.05),
                          borderRadius: BorderRadius.circular(16),
                          border: Border.all(
                            color: Colors.red.withValues(alpha: 0.2),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.error_outline,
                              color: Colors.red,
                              size: 20,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Text(
                                _error!,
                                style: const TextStyle(
                                  color: Colors.red,
                                  fontSize: 13,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),

                    const _SectionHeader(title: 'Artisan Workshop'),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _nameCtrl,
                      decoration: const InputDecoration(
                        labelText: 'Piece Name *',
                        hintText: 'Give your masterpiece a unique name...',
                        prefixIcon: Icon(Icons.label_important_outline),
                      ),
                      validator: (v) =>
                          v == null || v.isEmpty ? 'Required' : null,
                    ),
                    const SizedBox(height: 20),
                    TextFormField(
                      controller: _descCtrl,
                      maxLines: 4,
                      decoration: const InputDecoration(
                        labelText: 'The Artisan Story & Specs',
                        hintText:
                            'Detail the embroidery style, specific threadwork, and fabric...',
                        prefixIcon: Icon(Icons.history_edu_outlined),
                        alignLabelWithHint: true,
                      ),
                    ),
                    const SizedBox(height: 20),
                    DropdownButtonFormField<String>(
                      initialValue: _category,
                      decoration: const InputDecoration(
                        labelText: 'Heritage Category *',
                        prefixIcon: Icon(Icons.layers_outlined),
                      ),
                      items: _categories
                          .map(
                            (c) => DropdownMenuItem(value: c, child: Text(c)),
                          )
                          .toList(),
                      onChanged: (v) =>
                          setState(() => _category = v ?? _category),
                    ),
                    const SizedBox(height: 20),
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _priceCtrl,
                            keyboardType: const TextInputType.numberWithOptions(
                              decimal: true,
                            ),
                            decoration: const InputDecoration(
                              labelText: 'Price (₱) *',
                              prefixIcon: Icon(Icons.payments_outlined),
                            ),
                            validator: (v) {
                              if (v == null || v.isEmpty) return 'Required';
                              if (double.tryParse(v) == null) {
                                return 'Invalid price';
                              }
                              return null;
                            },
                          ),
                        ),
                        const SizedBox(width: 16),
                        Expanded(
                          child: TextFormField(
                            controller: _stockCtrl,
                            keyboardType: TextInputType.number,
                            decoration: const InputDecoration(
                              labelText: 'Stock *',
                              prefixIcon: Icon(Icons.inventory_2_outlined),
                            ),
                            validator: (v) {
                              if (v == null || v.isEmpty) return 'Required';
                              if (int.tryParse(v) == null) return 'Invalid';
                              return null;
                            },
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 32),

                    // Visual Showcase
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        const _SectionHeader(title: 'Visual Showcase'),
                        Text(
                          '${_images.length}/5 photos',
                          style: TextStyle(
                            fontSize: 11,
                            fontWeight: FontWeight.w900,
                            color: _images.length >= 3
                                ? const Color(0xFF43BF8E)
                                : Colors.orange,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),

                    // Image Grid
                    Wrap(
                      spacing: 12,
                      runSpacing: 12,
                      children: [
                        for (int i = 0; i < _images.length; i++)
                          Stack(
                            children: [
                              Container(
                                width: 100,
                                height: 130,
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: Colors.grey.shade200,
                                  ),
                                  image: DecorationImage(
                                    image: NetworkImage(_images[i]),
                                    fit: BoxFit.cover,
                                  ),
                                ),
                              ),
                              Positioned(
                                bottom: 0,
                                left: 0,
                                right: 0,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: Colors.black.withValues(alpha: 0.6),
                                    borderRadius: const BorderRadius.vertical(
                                      bottom: Radius.circular(16),
                                    ),
                                  ),
                                  child: Text(
                                    angleLabels[i].toUpperCase(),
                                    textAlign: TextAlign.center,
                                    style: const TextStyle(
                                      color: Colors.white,
                                      fontSize: 8,
                                      fontWeight: FontWeight.w900,
                                    ),
                                  ),
                                ),
                              ),
                              Positioned(
                                top: 4,
                                right: 4,
                                child: GestureDetector(
                                  onTap: () =>
                                      setState(() => _images.removeAt(i)),
                                  child: Container(
                                    padding: const EdgeInsets.all(4),
                                    decoration: const BoxDecoration(
                                      color: Colors.red,
                                      shape: BoxShape.circle,
                                    ),
                                    child: const Icon(
                                      Icons.close,
                                      size: 12,
                                      color: Colors.white,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        if (_images.length < 5)
                          GestureDetector(
                            onTap: _isUploading ? null : _pickAndUploadImage,
                            child: Container(
                              width: 100,
                              height: 130,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade50,
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(
                                  color: Colors.grey.shade200,
                                  style: BorderStyle.solid,
                                ),
                              ),
                              child: _isUploading
                                  ? const Center(
                                      child: CircularProgressIndicator(
                                        strokeWidth: 2,
                                        color: AppTheme.primary,
                                      ),
                                    )
                                  : Column(
                                      mainAxisAlignment:
                                          MainAxisAlignment.center,
                                      children: [
                                        const Icon(
                                          Icons.add_photo_alternate_outlined,
                                          color: AppTheme.textMuted,
                                          size: 28,
                                        ),
                                        const SizedBox(height: 8),
                                        Text(
                                          angleLabels[_images.length]
                                              .toUpperCase(),
                                          style: const TextStyle(
                                            fontSize: 8,
                                            fontWeight: FontWeight.w900,
                                            color: AppTheme.textMuted,
                                          ),
                                        ),
                                        const Text(
                                          'PICK IMAGE',
                                          style: TextStyle(
                                            fontSize: 7,
                                            fontWeight: FontWeight.bold,
                                            color: AppTheme.textMuted,
                                          ),
                                        ),
                                      ],
                                    ),
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 16),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.orange.withValues(alpha: 0.05),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: Colors.orange.withValues(alpha: 0.1),
                        ),
                      ),
                      child: const Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            color: Colors.orange,
                            size: 16,
                          ),
                          SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              'Minimum 3 (Front, Back, Detail). JPG/PNG/WebP supported.',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.orange,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),

                    const SizedBox(height: 40),
                    SizedBox(
                      width: double.infinity,
                      height: 60,
                      child: ElevatedButton(
                        onPressed: (_isLoading || _isUploading)
                            ? null
                            : _submit,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppTheme.primary,
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          elevation: 8,
                          shadowColor: AppTheme.primary.withValues(alpha: 0.3),
                        ),
                        child: _isLoading
                            ? const CircularProgressIndicator(
                                color: Colors.white,
                              )
                            : const Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  Text(
                                    'PUBLISH TO COLLECTION',
                                    style: TextStyle(
                                      fontWeight: FontWeight.w900,
                                      letterSpacing: 1.2,
                                    ),
                                  ),
                                  SizedBox(width: 8),
                                  Icon(Icons.arrow_forward),
                                ],
                              ),
                      ),
                    ),
                    const SizedBox(height: 24),
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

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 3,
          height: 16,
          color: AppTheme.primary,
          margin: const EdgeInsets.only(right: 8),
        ),
        Text(
          title.toUpperCase(),
          style: const TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w900,
            color: AppTheme.textPrimary,
            letterSpacing: 1.0,
          ),
        ),
      ],
    );
  }
}
