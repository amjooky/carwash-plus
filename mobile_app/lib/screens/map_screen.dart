import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../models/car_wash.dart';
import '../services/location_service.dart';
import '../providers/center_provider.dart';
import '../providers/auth_provider.dart';
import 'car_wash_details_screen.dart';
import '../widgets/center_map_card.dart';
import '../theme/app_theme.dart';
import '../services/notification_polling_service.dart';
import 'notifications_screen.dart';

class MapScreen extends StatefulWidget {
  const MapScreen({super.key});

  @override
  State<MapScreen> createState() => _MapScreenState();
}

class _MapScreenState extends State<MapScreen> with TickerProviderStateMixin {
  final LocationService _locationService = LocationService();
  final MapController _mapController = MapController();
  final PageController _pageController = PageController(viewportFraction: 0.85);
  
  // Animation controllers
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  Position? _currentPosition;
  bool _isInit = true;
  int _selectedIndex = 0;

  @override
  void initState() {
    super.initState();
    
    // Pulse animation setup
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat(reverse: true);
    
    _pulseAnimation = Tween<double>(begin: 0.8, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );

    _initializeMap();
  }

  Future<void> _initializeMap() async {
    try {
      final position = await _locationService.getCurrentLocation();
      if (mounted) {
        setState(() {
          _currentPosition = position;
        });
      }

      // Load centers via provider
      if (mounted) {
          await context.read<CenterProvider>().loadCenters();
      }
      
      // If we have position and centers, move to nearest
      // (Simplified: just move to user location)
      if (position != null && _isInit) {
         _shouldMoveToUser(position);
         _isInit = false;
      }

    } catch (e) {
      print('Error initializing map: $e');
    }
  }
  
  void _shouldMoveToUser(Position position) {
      _mapController.move(
        LatLng(position.latitude, position.longitude),
        13.0,
      );
  }

  void _onPageChanged(int index) {
    setState(() {
      _selectedIndex = index;
    });
    final centers = context.read<CenterProvider>().centers;
    if (index < centers.length) {
      final center = centers[index];
      _mapController.move(
        LatLng(center.latitude, center.longitude),
        15.0, // Zoom in when selecting card
      );
    }
  }

  void _onMarkerTapped(int index, CarWash center) {
     _pageController.animateToPage(
       index, 
       duration: const Duration(milliseconds: 500), 
       curve: Curves.easeInOut
     );
     // Map move is handled by page change listener usually, 
     // but here we might want to do it immediately
  }

  @override
  Widget build(BuildContext context) {
    final centerProvider = context.watch<CenterProvider>();
    final centers = centerProvider.centers;

    // Guest Mode Checks
    final authProvider = context.watch<AuthProvider>();
    final isLoggedIn = authProvider.isAuthenticated;
    final userName = isLoggedIn ? (authProvider.user?.firstName ?? 'Sam') : 'Guest';

    return Scaffold(
      extendBodyBehindAppBar: true,
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(
              initialCenter: _currentPosition != null 
                  ? LatLng(_currentPosition!.latitude, _currentPosition!.longitude)
                  : const LatLng(51.5, -0.09), // Default fallback
              initialZoom: 13.0,
              minZoom: 3.0,
              maxZoom: 18.0,
              interactionOptions: const InteractionOptions(
                flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
              ),
            ),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.example.mobile_app',
              ),
              MarkerLayer(
                markers: [
                  // User Location Marker (Pulsing)
                  if (_currentPosition != null)
                    Marker(
                      point: LatLng(_currentPosition!.latitude, _currentPosition!.longitude),
                      width: 60,
                      height: 60,
                      child: AnimatedBuilder(
                        animation: _pulseAnimation,
                        builder: (context, child) {
                          return Transform.scale(
                            scale: _pulseAnimation.value,
                            child: Container(
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: AppTheme.primaryBlue.withOpacity(0.3),
                                border: Border.all(color: Colors.white, width: 2),
                              ),
                              child: Center(
                                child: Container(
                                  width: 15,
                                  height: 15,
                                  decoration: const BoxDecoration(
                                    color: AppTheme.primaryBlue,
                                    shape: BoxShape.circle,
                                  ),
                                ),
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  
                  // Center Markers
                  ...centers.asMap().entries.map((entry) {
                    final index = entry.key;
                    final center = entry.value;
                    final isSelected = index == _selectedIndex;

                    return Marker(
                      point: LatLng(center.latitude, center.longitude),
                      width: isSelected ? 60 : 50,
                      height: isSelected ? 60 : 50,
                      child: GestureDetector(
                        onTap: () => _onMarkerTapped(index, center),
                        child: AnimatedScale(
                          scale: isSelected ? 1.2 : 1.0,
                          duration: const Duration(milliseconds: 300),
                          child: Column(
                            children: [
                              Container(
                                padding: const EdgeInsets.all(4),
                                decoration: BoxDecoration(
                                  color: isSelected ? AppTheme.primaryBlue : Colors.white,
                                  shape: BoxShape.circle,
                                  boxShadow: [
                                    BoxShadow(
                                      color: Colors.black.withOpacity(0.2),
                                      blurRadius: 6,
                                      offset: const Offset(0, 3),
                                    )
                                  ],
                                  border: Border.all(
                                    color: isSelected ? Colors.white : AppTheme.primaryBlue,
                                    width: 2
                                  )
                                ),
                                child: Icon(
                                  Icons.local_car_wash,
                                  color: isSelected ? Colors.white : AppTheme.primaryBlue,
                                  size: 24,
                                ),
                              ),
                              if (isSelected) 
                                Container(
                                  height: 6,
                                  width: 2,
                                  color: AppTheme.primaryBlue,
                                )
                            ],
                          ),
                        ),
                      ),
                    );
                  }),
                ],
              ),
            ],
          ),
          
          // Hero Header with Search
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(20, 0, 20, 20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.95),
                    Colors.white.withOpacity(0.0),
                  ],
                  stops: const [0.7, 1.0],
                ),
              ),
              child: SafeArea(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Good Morning, $userName 👋',
                              style: AppTheme.heading2.copyWith(fontSize: 22),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Find your perfect wash',
                              style: AppTheme.bodyMedium.copyWith(color: AppTheme.textSecondary),
                            ),
                          ],
                        ),
                        // Notification Icon (Only if Logged In)
                        if (isLoggedIn)
                          Row(
                            children: [
                              // Notification Icon
                            ValueListenableBuilder<int>(
                              valueListenable: NotificationPollingService().unreadCount,
                              builder: (context, count, child) {
                                return Stack(
                                  clipBehavior: Clip.none,
                                  children: [
                                    Container(
                                      margin: const EdgeInsets.only(right: 12),
                                      decoration: BoxDecoration(
                                        color: Colors.white,
                                        shape: BoxShape.circle,
                                        boxShadow: AppTheme.defaultCardShadow,
                                      ),
                                      child: IconButton(
                                        icon: const Icon(Icons.notifications_outlined, color: AppTheme.textPrimary),
                                        onPressed: () {
                                          Navigator.push(
                                            context,
                                            MaterialPageRoute(builder: (context) => const NotificationsScreen()),
                                          );
                                        },
                                      ),
                                    ),
                                    if (count > 0)
                                      Positioned(
                                        right: 12, // Align with margin
                                        top: -2,
                                        child: Container(
                                          padding: const EdgeInsets.all(4),
                                          decoration: const BoxDecoration(
                                            color: Colors.red,
                                            shape: BoxShape.circle,
                                          ),
                                          constraints: const BoxConstraints(
                                            minWidth: 18,
                                            minHeight: 18,
                                          ),
                                          child: Text(
                                            '$count',
                                            style: const TextStyle(
                                              color: Colors.white,
                                              fontSize: 10,
                                              fontWeight: FontWeight.bold,
                                            ),
                                            textAlign: TextAlign.center,
                                          ),
                                        ),
                                      ),
                                  ],
                                );
                              },
                            ),
                            
                            // Refresh Button
                            Container(
                              decoration: BoxDecoration(
                                color: Colors.white,
                                shape: BoxShape.circle,
                                boxShadow: AppTheme.defaultCardShadow,
                              ),
                              child: IconButton(
                                icon: const Icon(Icons.refresh, color: AppTheme.primaryBlue),
                                onPressed: () => centerProvider.loadCenters(forceRefresh: true),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Search Bar
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(16),
                        boxShadow: [
                          BoxShadow(
                            color: AppTheme.primaryBlue.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                        border: Border.all(color: AppTheme.borderGray),
                      ),
                      child: TextField(
                        decoration: InputDecoration(
                          hintText: 'Search for nearby car wash...',
                          hintStyle: const TextStyle(color: AppTheme.textSecondary),
                          border: InputBorder.none,
                          icon: const Icon(Icons.search, color: AppTheme.primaryBlue),
                          suffixIcon: IconButton(
                            icon: const Icon(Icons.tune, color: AppTheme.textPrimary),
                            onPressed: () {},
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // Bottom Carousel
          if (centerProvider.isLoading && centers.isEmpty)
             const Center(child: CircularProgressIndicator())
          else if (centers.isNotEmpty)
            Positioned(
              bottom: 120,
              left: 0,
              right: 0,
              height: 240,
              child: PageView.builder(
                controller: _pageController,
                itemCount: centers.length,
                onPageChanged: _onPageChanged,
                itemBuilder: (context, index) {
                  return CenterMapCard(
                    carWash: centers[index],
                    isSelected: index == _selectedIndex,
                    onTap: () {
                       Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => CarWashDetailsScreen(carWash: centers[index]),
                        ),
                      );
                    },
                  );
                },
              ),
            )
           else if (!centerProvider.isLoading && centers.isEmpty && _currentPosition != null)
             Positioned(
               bottom: 140,
               left: 20,
               right: 20,
               child: Container(
                 padding: const EdgeInsets.all(16),
                 decoration: BoxDecoration(
                   color: Colors.white,
                   borderRadius: BorderRadius.circular(16)
                 ),
                 child: const Text('No car washes found nearby. Try increasing search range.', textAlign: TextAlign.center),
               ),
             ),

          // My Location Button
          Positioned(
            right: 20,
            bottom: 380, // Above carousel
            child: FloatingActionButton(
              heroTag: 'mapLocationBtn',
              backgroundColor: Colors.white,
              child: const Icon(Icons.my_location, color: Colors.black87),
              onPressed: () async {
                final pos = await _locationService.getCurrentLocation();
                if (pos != null) {
                  setState(() => _currentPosition = pos);
                  _mapController.move(
                    LatLng(pos.latitude, pos.longitude),
                    14.0,
                  );
                }
              },
            ),
          ),
        ],
      ),
    );
  }


  @override
  void dispose() {
    _mapController.dispose();
    _pageController.dispose();
    _pulseController.dispose();
    super.dispose();
  }
}

