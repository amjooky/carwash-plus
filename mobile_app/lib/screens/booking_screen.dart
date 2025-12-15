import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import '../models/car_wash.dart';
import '../models/service.dart';
import '../models/vehicle.dart';
import '../services/api_service.dart';
import '../utils/currency_formatter.dart';
import '../widgets/bay_selection_widget.dart';
import '../widgets/horizontal_calendar.dart';
import '../widgets/time_slot_grid.dart';
import '../providers/vehicle_provider.dart';
import '../providers/auth_provider.dart';
import 'booking_confirmation_screen.dart';
import 'add_edit_car_screen.dart';
import '../widgets/booking_summary_card.dart';
import '../theme/app_theme.dart';

class BookingScreen extends StatefulWidget {
  final CarWash carWash;
  final Service service;

  const BookingScreen({
    super.key,
    required this.carWash,
    required this.service,
  });

  @override
  State<BookingScreen> createState() => _BookingScreenState();
}

class _BookingScreenState extends State<BookingScreen> {
  final ApiService _apiService = ApiService();
  final _formKey = GlobalKey<FormState>();
  
  DateTime _selectedDate = DateTime.now();
  TimeOfDay? _selectedTime;
  final TextEditingController _notesController = TextEditingController();
  bool _isSubmitting = false;
  int? _selectedBay;
  
  Vehicle? _selectedVehicle;
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<VehicleProvider>().loadVehicles();
    });
  }

  Future<void> _submitBooking() async {
    if (!_formKey.currentState!.validate()) return;
    
    if (_selectedVehicle == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a vehicle'), backgroundColor: AppTheme.errorDanger),
      );
      return;
    }

    if (_selectedTime == null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please select a time slot'), backgroundColor: AppTheme.errorDanger),
        );
        return;
    }

    setState(() => _isSubmitting = true);

    try {
      final timeString = '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}';
      
      final bookingData = {
        'centerId': widget.carWash.id,
        'vehicleId': _selectedVehicle!.id,
        'serviceIds': [widget.service.id],
        'scheduledDate': _selectedDate.toIso8601String(),
        'scheduledTime': timeString,
        'bayNumber': _selectedBay,
        'notes': _notesController.text.isEmpty ? null : _notesController.text,
      };

      final booking = await _apiService.createBooking(bookingData);

      setState(() => _isSubmitting = false);

      if (booking != null && mounted) {
        Navigator.pushReplacement(
          context,
          MaterialPageRoute(builder: (context) => BookingConfirmationScreen(booking: booking)),
        );
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Failed to create booking. Please try again.'), backgroundColor: AppTheme.errorDanger),
          );
        }
      }
    } catch (e) {
      setState(() => _isSubmitting = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: AppTheme.errorDanger),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundLight,
      body: SafeArea(
        child: Column(
          children: [
            // Custom Header
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 16, 20, 8),
              child: Row(
                children: [
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.defaultCardShadow,
                    ),
                    child: IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppTheme.textPrimary),
                      onPressed: () => Navigator.pop(context),
                    ),
                  ),
                  const SizedBox(width: 16),
                  const Text('Book Appointment', style: AppTheme.heading2),
                  const Spacer(),
                  Container(
                    decoration: BoxDecoration(
                      color: Colors.white,
                      shape: BoxShape.circle,
                      boxShadow: AppTheme.defaultCardShadow,
                    ),
                    padding: const EdgeInsets.all(8),
                    child: Image.asset('assets/images/logo.png', height: 32, width: 32),
                  ),
                ],
              ),
            ),

            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Car Wash & Service Info Card
                      Container(
                        padding: const EdgeInsets.all(20),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          borderRadius: BorderRadius.circular(20),
                          boxShadow: AppTheme.defaultCardShadow,
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(widget.carWash.name, style: AppTheme.heading3),
                            const SizedBox(height: 4),
                            Row(
                               children: [
                                   const Icon(Icons.location_on_outlined, size: 16, color: Colors.grey),
                                   const SizedBox(width: 4),
                                   Expanded(child: Text(widget.carWash.address, style: AppTheme.bodySmall, maxLines: 1, overflow: TextOverflow.ellipsis)),
                               ],
                            ),
                            const Padding(padding: EdgeInsets.symmetric(vertical: 16), child: Divider(height: 1)),
                            Row(
                              mainAxisAlignment: MainAxisAlignment.spaceBetween,
                              children: [
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text('Selected Service', style: AppTheme.bodySmall),
                                    const SizedBox(height: 4),
                                    Text(widget.service.name, style: AppTheme.heading3.copyWith(fontSize: 16)),
                                  ],
                                ),
                                Column(
                                  crossAxisAlignment: CrossAxisAlignment.end,
                                  children: [
                                    Text('Price', style: AppTheme.bodySmall),
                                    const SizedBox(height: 4),
                                    Text(CurrencyFormatter.format(widget.service.price), style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppTheme.primaryBlue)),
                                  ],
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Date Selection
                      const Text('Select Date', style: AppTheme.heading3),
                      const SizedBox(height: 16),
                      HorizontalCalendar(
                        selectedDate: _selectedDate,
                        onDateSelected: (date) {
                          setState(() {
                            _selectedDate = date;
                            _selectedTime = null;
                            _selectedBay = null;
                          });
                        },
                      ),
                      const SizedBox(height: 24),

                      // Time Selection
                      const Text('Select Time', style: AppTheme.heading3),
                      const SizedBox(height: 16),
                      TimeSlotGrid(
                        centerId: widget.carWash.id,
                        selectedDate: _selectedDate,
                        selectedTime: _selectedTime != null 
                            ? '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}'
                            : null,
                        onTimeSelected: (timeString) {
                          final parts = timeString.split(':');
                          setState(() {
                            _selectedTime = TimeOfDay(
                              hour: int.parse(parts[0]),
                              minute: int.parse(parts[1]),
                            );
                            _selectedBay = null;
                          });
                        },
                      ),
                      const SizedBox(height: 24),

                      // Vehicle Selection
                      const Text('Select Vehicle', style: AppTheme.heading3),
                      const SizedBox(height: 16),
                      Consumer<VehicleProvider>(
                        builder: (context, vehicleProvider, child) {
                          if (vehicleProvider.isLoading && vehicleProvider.vehicles.isEmpty) {
                             return const Center(child: Padding(padding: EdgeInsets.all(16), child: CircularProgressIndicator()));
                          }

                          if (vehicleProvider.vehicles.isEmpty) {
                            return Container(
                              padding: const EdgeInsets.all(20),
                              decoration: BoxDecoration(
                                color: AppTheme.warningDirty.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(16),
                                border: Border.all(color: AppTheme.warningDirty.withOpacity(0.3)),
                              ),
                              child: Column(
                                children: [
                                  const Icon(Icons.directions_car_outlined, size: 40, color: AppTheme.warningDirty),
                                  const SizedBox(height: 12),
                                  const Text('No vehicles saved', style: TextStyle(fontWeight: FontWeight.bold, color: AppTheme.warningDirty)),
                                  const SizedBox(height: 12),
                                  ElevatedButton(
                                    onPressed: () async {
                                      final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditCarScreen()));
                                      if (result == true) context.read<VehicleProvider>().loadVehicles();
                                    },
                                    style: ElevatedButton.styleFrom(backgroundColor: AppTheme.warningDirty, foregroundColor: Colors.white),
                                    child: const Text('Add Vehicle'),
                                  ),
                                ],
                              ),
                            );
                          }

                          // Auto-select
                          if (_selectedVehicle == null && vehicleProvider.vehicles.isNotEmpty) {
                             WidgetsBinding.instance.addPostFrameCallback((_) {
                               if (mounted) setState(() => _selectedVehicle = vehicleProvider.vehicles.first);
                             });
                          }

                          return Column(
                            children: [
                              ...vehicleProvider.vehicles.map((vehicle) {
                                final isSelected = _selectedVehicle?.id == vehicle.id;
                                return GestureDetector(
                                  onTap: () => setState(() => _selectedVehicle = vehicle),
                                  child: Container(
                                    margin: const EdgeInsets.only(bottom: 12),
                                    padding: const EdgeInsets.all(16),
                                    decoration: BoxDecoration(
                                      color: isSelected ? AppTheme.primaryBlue.withOpacity(0.05) : Colors.white,
                                      border: Border.all(
                                        color: isSelected ? AppTheme.primaryBlue : Colors.transparent,
                                        width: 2,
                                      ),
                                      borderRadius: BorderRadius.circular(16),
                                      boxShadow: isSelected ? [] : AppTheme.defaultCardShadow,
                                    ),
                                    child: Row(
                                      children: [
                                        Container(
                                            padding: const EdgeInsets.all(8),
                                            decoration: BoxDecoration(color: isSelected ? AppTheme.primaryBlue.withOpacity(0.1) : Colors.grey[100], borderRadius: BorderRadius.circular(8)),
                                            child: Icon(Icons.directions_car_filled, color: isSelected ? AppTheme.primaryBlue : Colors.grey),
                                        ),
                                        const SizedBox(width: 16),
                                        Expanded(
                                          child: Column(
                                            crossAxisAlignment: CrossAxisAlignment.start,
                                            children: [
                                              Text(vehicle.fullName, style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: isSelected ? AppTheme.primaryBlue : AppTheme.textPrimary)),
                                              const SizedBox(height: 4),
                                              Text('${vehicle.color} • ${vehicle.licensePlate}', style: AppTheme.bodySmall),
                                            ],
                                          ),
                                        ),
                                        if (isSelected) const Icon(Icons.check_circle, color: AppTheme.primaryBlue),
                                      ],
                                    ),
                                  ),
                                );
                              }),
                              TextButton.icon(
                                onPressed: () async {
                                  final result = await Navigator.push(context, MaterialPageRoute(builder: (_) => const AddEditCarScreen()));
                                  if (result == true) context.read<VehicleProvider>().loadVehicles();
                                },
                                icon: const Icon(Icons.add, color: AppTheme.primaryBlue),
                                label: const Text('Add Another Vehicle', style: TextStyle(color: AppTheme.primaryBlue)),
                              ),
                            ],
                          );
                        },
                      ),
                      const SizedBox(height: 24),

                      // Bay Selection
                      if (_selectedTime != null) ...[
                          const Text('Select Bay (Optional)', style: AppTheme.heading3),
                          const SizedBox(height: 16),
                          BaySelectionWidget(
                            centerId: widget.carWash.id,
                            selectedDate: _selectedDate,
                            selectedTime: '${_selectedTime!.hour.toString().padLeft(2, '0')}:${_selectedTime!.minute.toString().padLeft(2, '0')}',
                            selectedBay: _selectedBay,
                            onBaySelected: (bay) => setState(() => _selectedBay = bay),
                          ),
                          const SizedBox(height: 24),
                      ],
 
                      // Notes
                      const Text('Additional Notes', style: AppTheme.heading3),
                      const SizedBox(height: 16),
                      Container(
                        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(16), boxShadow: AppTheme.defaultCardShadow),
                        child: TextFormField(
                          controller: _notesController,
                          maxLines: 3,
                          decoration: InputDecoration(
                            hintText: 'Any special requests...',
                            hintStyle: TextStyle(color: Colors.grey[400]),
                            border: InputBorder.none,
                            contentPadding: const EdgeInsets.all(16),
                          ),
                        ),
                      ),
                      const SizedBox(height: 32),

                      // Summary & Button
                      if (_selectedTime != null && _selectedVehicle != null) ...[
                         BookingSummaryCard(
                            service: widget.service,
                            vehicle: _selectedVehicle,
                            date: _selectedDate,
                            time: _selectedTime,
                            bayNumber: _selectedBay,
                            totalPrice: widget.service.price,
                         ),
                         const SizedBox(height: 24),
                      ],

                      SizedBox(
                        width: double.infinity,
                        child: ElevatedButton(
                          onPressed: _isSubmitting ? null : _submitBooking,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppTheme.primaryBlue,
                            foregroundColor: Colors.white,
                            padding: const EdgeInsets.symmetric(vertical: 18),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                            elevation: 8,
                            shadowColor: AppTheme.primaryBlue.withOpacity(0.5)
                          ),
                          child: _isSubmitting
                              ? const SizedBox(height: 24, width: 24, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                              : const Text('Confirm Order', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        ),
                      ),
                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  void dispose() {
    _notesController.dispose();
    super.dispose();
  }
}
