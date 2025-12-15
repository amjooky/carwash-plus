import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/car_wash.dart';
import '../theme/app_theme.dart';
import 'booking_screen.dart';
import 'onboarding/login_screen.dart';
import '../providers/auth_provider.dart';
import '../providers/center_provider.dart';
import '../widgets/service_card.dart';
import '../widgets/guest_login_sheet.dart';

class CarWashDetailsScreen extends StatefulWidget {
  final CarWash carWash;

  const CarWashDetailsScreen({super.key, required this.carWash});

  @override
  State<CarWashDetailsScreen> createState() => _CarWashDetailsScreenState();
}

class _CarWashDetailsScreenState extends State<CarWashDetailsScreen> {
  int _activePageIndex = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<CenterProvider>().loadServices(widget.carWash.id);
    });
  }

  void _checkLoginAndProceed(VoidCallback onProceed) {
    final isLoggedIn = context.read<AuthProvider>().isAuthenticated;
    if (isLoggedIn) {
      onProceed();
    } else {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (context) => const GuestLoginSheet(),
      );
    }
  }

  Future<void> _refreshServices() async {
    await context.read<CenterProvider>().loadServices(widget.carWash.id, forceRefresh: true);
  }

  @override
  Widget build(BuildContext context) {
    // Collect all images: prioritize API images, otherwise fallback
    final hasImages = widget.carWash.images != null && widget.carWash.images!.isNotEmpty;
    final images = hasImages ? widget.carWash.images! : [];

    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: RefreshIndicator(
        onRefresh: _refreshServices,
        child: CustomScrollView(
          physics: const BouncingScrollPhysics(),
          slivers: [
            // --- 1. Hero Image Carousel ---
            SliverAppBar(
              expandedHeight: 300, 
              pinned: true,
              stretch: true,
              backgroundColor: AppTheme.primaryBlue,
              leading: Container(
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.9),
                  shape: BoxShape.circle,
                ),
                child: IconButton(
                  icon: const Icon(Icons.arrow_back, color: Colors.black87),
                  onPressed: () => Navigator.pop(context),
                ),
              ),
              actions: [
                Container(
                   margin: const EdgeInsets.all(8),
                   decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.9),
                    shape: BoxShape.circle,
                  ),
                  child: IconButton(
                    icon: const Icon(Icons.favorite_border, color: Colors.black87),
                    onPressed: () {
                      // TODO: Implement Favorite toggle
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Added to favorites')),
                      );
                    },
                  ),
                ),
              ],
              flexibleSpace: FlexibleSpaceBar(
                stretchModes: const [StretchMode.zoomBackground],
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    // A) Carousel
                    if (hasImages)
                      PageView.builder(
                        itemCount: images.length,
                        onPageChanged: (index) {
                          setState(() => _activePageIndex = index);
                        },
                        itemBuilder: (context, index) {
                          return Image.network(
                            images[index],
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) =>
                                Container(color: Colors.grey.shade200),
                          );
                        },
                      )
                    else
                      // Fallback Gradient
                      Container(
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topCenter,
                            end: Alignment.bottomCenter,
                            colors: [
                              Colors.blue.shade400,
                              Colors.blue.shade800,
                            ],
                          ),
                        ),
                        child: const Center(
                          child: Icon(Icons.local_car_wash, size: 80, color: Colors.white54),
                        ),
                      ),

                    // B) Gradient Overlay (Bottom) for text contrast
                    Positioned(
                       bottom: 0,
                       left: 0,
                       right: 0,
                       height: 100,
                       child: Container(
                         decoration: BoxDecoration(
                           gradient: LinearGradient(
                             begin: Alignment.topCenter,
                             end: Alignment.bottomCenter,
                             colors: [Colors.transparent, Colors.black.withOpacity(0.7)],
                           ),
                         ),
                       ),
                    ),

                    // C) Page Indicators
                    if (hasImages && images.length > 1)
                      Positioned(
                        bottom: 16,
                        left: 0,
                        right: 0,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: images.asMap().entries.map((entry) {
                            return Container(
                              width: 8.0,
                              height: 8.0,
                              margin: const EdgeInsets.symmetric(horizontal: 4.0),
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: _activePageIndex == entry.key
                                    ? Colors.white
                                    : Colors.white.withOpacity(0.4),
                              ),
                            );
                          }).toList(),
                        ),
                      ),
                  ],
                ),
              ),
            ),

            // --- 2. Center Info Header ---
            SliverToBoxAdapter(
              child: Container(
                transform: Matrix4.translationValues(0, -20, 0), // Overlap effect
                decoration: const BoxDecoration(
                  color: AppTheme.backgroundLight,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                ),
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(20, 30, 20, 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Title & Rating
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Expanded(
                            child: Text(
                              widget.carWash.name,
                              style: AppTheme.heading2,
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                            decoration: BoxDecoration(
                              color: Colors.amber.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: Colors.amber.withOpacity(0.5)),
                            ),
                            child: Row(
                              children: [
                                const Icon(Icons.star, color: Colors.amber, size: 18),
                                const SizedBox(width: 4),
                                Text(
                                  widget.carWash.rating?.toStringAsFixed(1) ?? 'New',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Colors.amber,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),

                      // Metadata Rows
                      Row(
                        children: [
                          const Icon(Icons.location_on_outlined, size: 18, color: AppTheme.textSecondary),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              widget.carWash.address,
                              style: AppTheme.bodyMedium.copyWith(color: AppTheme.textSecondary),
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                          ),
                        ],
                      ),
                      if (widget.carWash.phone != null) ...[
                        const SizedBox(height: 8),
                        Row(
                          children: [
                             const Icon(Icons.phone_outlined, size: 18, color: AppTheme.textSecondary),
                             const SizedBox(width: 8),
                             Text(
                               widget.carWash.phone!,
                               style: AppTheme.bodyMedium.copyWith(color: AppTheme.textSecondary),
                             ),
                          ],
                        ),
                      ],
                      const SizedBox(height: 16),
                      
                      // Operating Hours - Simplified
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(12),
                          boxShadow: AppTheme.defaultCardShadow,
                        ),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildInfoBadge(Icons.access_time, 'Opens', widget.carWash.openTime),
                            Container(width: 1, height: 30, color: AppTheme.borderGray),
                            _buildInfoBadge(Icons.access_time_filled, 'Closes', widget.carWash.closeTime),
                            Container(width: 1, height: 30, color: AppTheme.borderGray),
                            _buildInfoBadge(Icons.local_car_wash, 'Capacity', '${widget.carWash.capacity} Cars'),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),

            // --- 3. About Section ---
            if (widget.carWash.description != null)
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('About', style: AppTheme.heading3),
                      const SizedBox(height: 8),
                      Text(
                        widget.carWash.description!,
                        style: AppTheme.bodyMedium.copyWith(color: AppTheme.textSecondary),
                        maxLines: 4,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),
              ),

            // --- 4. Services Header ---
            SliverAppBar(
              pinned: true,
              toolbarHeight: 50,
              backgroundColor: AppTheme.backgroundLight,
              surfaceTintColor: AppTheme.backgroundLight,
              automaticallyImplyLeading: false,
              title: const Text('Services', style: AppTheme.heading3),
              centerTitle: false,
              titleSpacing: 20,
              elevation: 0,
            ),

            // --- 5. Services List ---
            SliverPadding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
              sliver: Consumer<CenterProvider>(
                builder: (context, provider, child) {
                  final services = provider.getServicesForCenter(widget.carWash.id);

                  if (provider.isLoading && services.isEmpty) {
                    return const SliverToBoxAdapter(
                      child: Padding(
                        padding: EdgeInsets.all(40),
                        child: Center(child: CircularProgressIndicator()),
                      ),
                    );
                  }

                  if (services.isEmpty) {
                    return SliverToBoxAdapter(
                      child: Padding(
                        padding: const EdgeInsets.all(40),
                        child: Column(
                          children: [
                            Icon(Icons.cleaning_services, size: 48, color: Colors.grey[300]),
                            const SizedBox(height: 16),
                            Text(
                              'No services available yet.',
                              style: TextStyle(color: Colors.grey[500]),
                            ),
                          ],
                        ),
                      ),
                    );
                  }

                  return SliverList(
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        final service = services[index];
                        return ServiceCard(
                          service: service,
                          onTap: () {
                            _checkLoginAndProceed(() {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => BookingScreen(
                                    carWash: widget.carWash,
                                    service: service,
                                  ),
                                ),
                              );
                            });
                          },
                        );
                      },
                      childCount: services.length,
                    ),
                  );
                },
              ),
            ),
            
            // Extra padding at bottom
             const SliverToBoxAdapter(child: SizedBox(height: 100)),
          ],
        ),
      ),
      
      // Floating Bottom Bar
      bottomSheet: Container(
         color: Colors.transparent, // Background handled by container styling
         child: SafeArea(
           child: Padding(
             padding: const EdgeInsets.all(20.0),
             child: ElevatedButton(
                onPressed: () {
                  _checkLoginAndProceed(() {
                    // Default to first service or show modal picker
                    final services = context.read<CenterProvider>().getServicesForCenter(widget.carWash.id);
                    if (services.isNotEmpty) {
                       Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (context) => BookingScreen(
                                  carWash: widget.carWash,
                                  service: services.first,
                                ),
                              ),
                            );
                    } else {
                      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('No services available to book')));
                    }
                  });
                },
                style: ElevatedButton.styleFrom(
                   backgroundColor: AppTheme.primaryBlue,
                   padding: const EdgeInsets.symmetric(vertical: 16),
                   shadowColor: AppTheme.primaryBlue.withOpacity(0.5),
                   elevation: 8,
                   shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))
                ),
                child: const Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("Book Appointment", style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                    SizedBox(width: 8),
                    Icon(Icons.arrow_forward_rounded)
                  ],
                ),
             ),
           ),
         ),
      ),
    );
  }

  Widget _buildInfoBadge(IconData icon, String label, String value) {
    return Column(
      children: [
        Icon(icon, size: 20, color: AppTheme.primaryBlue),
        const SizedBox(height: 4),
        Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
        Text(label, style: const TextStyle(fontSize: 10, color: AppTheme.textSecondary)),
      ],
    );
  }
}
