import 'package:flutter/material.dart';
import '../models/vehicle.dart';
import '../services/vehicle_service.dart';
import '../services/nhtsa_service.dart';

class AddEditCarScreen extends StatefulWidget {
  final Vehicle? vehicle;
  final bool isFirstTimeSetup;

  const AddEditCarScreen({
    super.key,
    this.vehicle,
    this.isFirstTimeSetup = false,
  });

  @override
  State<AddEditCarScreen> createState() => _AddEditCarScreenState();
}

class _AddEditCarScreenState extends State<AddEditCarScreen> {
  final _formKey = GlobalKey<FormState>();
  final _vehicleService = VehicleService();
  final _nhtsaService = NhtsaService();

  late TextEditingController _makeController;
  late TextEditingController _modelController;
  late TextEditingController _trimController;
  late TextEditingController _colorController;
  late TextEditingController _licensePlateController;
  late TextEditingController _notesController;

  VehicleType _selectedType = VehicleType.SEDAN;
  int _selectedYear = DateTime.now().year;
  
  bool _isLoading = false;
  bool _isLoadingModels = false;
  List<String> _availableModels = [];
  String? _vehicleImageUrl;
  bool _isLoadingImage = false;

  @override
  void initState() {
    super.initState();
    _makeController = TextEditingController(text: widget.vehicle?.make ?? '');
    _modelController = TextEditingController(text: widget.vehicle?.model ?? '');
    _selectedYear = widget.vehicle?.year ?? DateTime.now().year;
    _trimController = TextEditingController(text: widget.vehicle?.trim ?? '');
    _colorController = TextEditingController(text: widget.vehicle?.color ?? '');
    _licensePlateController =
        TextEditingController(text: widget.vehicle?.licensePlate ?? '');
    _notesController = TextEditingController(text: widget.vehicle?.notes ?? '');
    _selectedType = widget.vehicle?.type ?? VehicleType.SEDAN;
    _vehicleImageUrl = widget.vehicle?.imageUrl;

    if (widget.vehicle != null) {
      // Pre-load models if editing existing vehicle
      _fetchModels(widget.vehicle!.make, widget.vehicle!.year);
    }
  }

  @override
  void dispose() {
    _makeController.dispose();
    _modelController.dispose();
    _trimController.dispose();
    _colorController.dispose();
    _licensePlateController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _fetchVehicleImage() async {
    final make = _makeController.text.trim();
    final model = _modelController.text.trim();
    
    if (make.isEmpty || model.isEmpty) return;
    
    setState(() => _isLoadingImage = true);
    
    try {
      final imageUrl = await _nhtsaService.getVehicleImageUrl(make, model, _selectedYear);
      if (mounted) {
         setState(() {
           _vehicleImageUrl = imageUrl;
           _isLoadingImage = false;
         });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoadingImage = false);
    }
  }

  Future<void> _fetchModels(String make, int year) async {
    if (make.isEmpty) return;
    
    setState(() {
      _isLoadingModels = true;
      _vehicleImageUrl = null; // Reset image when make changes
    });
    
    try {
      final models = await _nhtsaService.getModels(make, year);
      if (mounted) {
        setState(() {
          _availableModels = models;
          _isLoadingModels = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoadingModels = false);
      }
    }
  }

  Future<void> _saveVehicle() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      final vehicleData = {
        'make': _makeController.text.trim(),
        'model': _modelController.text.trim(),
        'year': _selectedYear,
        'trim': _trimController.text.trim().isEmpty
            ? null
            : _trimController.text.trim(),
        'color': _colorController.text.trim(),
        'licensePlate': _licensePlateController.text.trim().toUpperCase(),
        'type': _selectedType.toString().split('.').last,
        'notes': _notesController.text.trim().isEmpty
            ? null
            : _notesController.text.trim(),
        'imageUrl': _vehicleImageUrl,
      };

      if (widget.vehicle == null) {
        await _vehicleService.addVehicle(vehicleData);
      } else {
        await _vehicleService.updateVehicle(widget.vehicle!.id, vehicleData);
      }

      if (mounted) {
        Navigator.pop(context, true);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(
              widget.vehicle == null
                  ? 'Vehicle added successfully'
                  : 'Vehicle updated successfully',
            ),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.vehicle == null ? 'Add Vehicle' : 'Edit Vehicle'),
        automaticallyImplyLeading: !widget.isFirstTimeSetup,
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(24.0),
          children: [
            if (widget.isFirstTimeSetup) ...[
              const Icon(Icons.directions_car, size: 64, color: Colors.blue),
              const SizedBox(height: 16),
              Text(
                'Add Your First Vehicle',
                style: Theme.of(context).textTheme.headlineSmall,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 8),
              Text(
                'Let\'s add your vehicle to make booking easier',
                style: Theme.of(context).textTheme.bodyMedium,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
            ],

            // Vehicle Image
            if (_isLoadingImage)
               const Center(child: CircularProgressIndicator())
            else if (_vehicleImageUrl != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 24.0),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(12),
                  child: Image.network(
                    _vehicleImageUrl!,
                    height: 200,
                    width: double.infinity,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) =>
                        const SizedBox.shrink(),
                  ),
                ),
              ),

            // Make Autocomplete
            Autocomplete<String>(
              initialValue: TextEditingValue(text: _makeController.text),
              optionsBuilder: (TextEditingValue textEditingValue) {
                if (textEditingValue.text == '') {
                  return const Iterable<String>.empty();
                }
                return NhtsaService.commonMakes.where((String option) {
                  return option.toLowerCase().contains(textEditingValue.text.toLowerCase());
                });
              },
              onSelected: (String selection) {
                setState(() {
                  _makeController.text = selection;
                  _modelController.clear();
                  _availableModels = [];
                });
                _fetchModels(selection, _selectedYear);
              },
              fieldViewBuilder: (context, controller, focusNode, onEditingComplete) {
                // Keep local controller in sync
                controller.addListener(() {
                  _makeController.text = controller.text;
                });
                return TextFormField(
                  controller: controller,
                  focusNode: focusNode,
                  onEditingComplete: onEditingComplete,
                  decoration: const InputDecoration(
                    labelText: 'Make *',
                    hintText: 'e.g. Toyota',
                    prefixIcon: Icon(Icons.business),
                    border: OutlineInputBorder(),
                  ),
                  validator: (value) {
                     if (value == null || value.trim().isEmpty) return 'Required';
                     return null;
                  },
                );
              },
            ),
            const SizedBox(height: 16),

            // Model Autocomplete
            Autocomplete<String>(
              key: ValueKey('$_selectedYear-${_makeController.text}'), // Force rebuild on dependency change
              initialValue: TextEditingValue(text: _modelController.text),
              optionsBuilder: (TextEditingValue textEditingValue) {
                if (textEditingValue.text == '') {
                  return _availableModels; // Show all if empty? Or maybe empty iterable
                }
                return _availableModels.where((String option) {
                  return option.toLowerCase().contains(textEditingValue.text.toLowerCase());
                });
              },
              onSelected: (String selection) {
                _modelController.text = selection;
                _fetchVehicleImage();
              },
              fieldViewBuilder: (context, controller, focusNode, onEditingComplete) {
                 controller.addListener(() {
                  _modelController.text = controller.text;
                });
                return TextFormField(
                  controller: controller,
                  focusNode: focusNode,
                  onEditingComplete: onEditingComplete,
                  decoration: InputDecoration(
                    labelText: 'Model *',
                    hintText: 'e.g. Camry',
                    prefixIcon: const Icon(Icons.directions_car),
                    border: const OutlineInputBorder(),
                    suffixIcon: _isLoadingModels 
                        ? const Padding(padding: EdgeInsets.all(12), child: CircularProgressIndicator(strokeWidth: 2))
                        : null,
                  ),
                  validator: (value) {
                     if (value == null || value.trim().isEmpty) return 'Required';
                     return null;
                  },
                );
              },
            ),
            const SizedBox(height: 16),

            Row(
              children: [
                // Year
                Expanded(
                  flex: 2,
                  child: DropdownButtonFormField<int>(
                    value: _selectedYear,
                    decoration: const InputDecoration(
                      labelText: 'Year *',
                      border: OutlineInputBorder(),
                      prefixIcon: Icon(Icons.calendar_today),
                    ),
                    items: _nhtsaService.getYears().map((year) {
                      return DropdownMenuItem(
                        value: year,
                        child: Text(year.toString()),
                      );
                    }).toList(),
                    onChanged: (value) {
                      if (value != null) {
                        setState(() {
                          _selectedYear = value;
                          // Clear model if year changes as models vary by year
                           _modelController.clear();
                           _availableModels = [];
                        });
                        _fetchModels(_makeController.text, value);
                      }
                    },
                  ),
                ),
                const SizedBox(width: 12),

                // Trim (optional)
                Expanded(
                  flex: 3,
                  child: TextFormField(
                    controller: _trimController,
                    decoration: const InputDecoration(
                      labelText: 'Trim',
                      hintText: 'e.g. EX, LX, Sport',
                      border: OutlineInputBorder(),
                    ),
                    textCapitalization: TextCapitalization.words,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 16),

            // Vehicle Type
            DropdownButtonFormField<VehicleType>(
              value: _selectedType,
              decoration: const InputDecoration(
                labelText: 'Vehicle Type *',
                prefixIcon: Icon(Icons.category),
                border: OutlineInputBorder(),
              ),
              items: VehicleType.values.map((type) {
                return DropdownMenuItem(
                  value: type,
                  child: Text(_formatVehicleType(type)),
                );
              }).toList(),
              onChanged: (value) {
                if (value != null) {
                  setState(() => _selectedType = value);
                }
              },
            ),
            const SizedBox(height: 16),

            // Color
            TextFormField(
              controller: _colorController,
              decoration: const InputDecoration(
                labelText: 'Color *',
                hintText: 'e.g. Black, White, Blue',
                prefixIcon: Icon(Icons.palette),
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.words,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the color';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // License Plate
            TextFormField(
              controller: _licensePlateController,
              decoration: const InputDecoration(
                labelText: 'License Plate *',
                hintText: 'e.g. ABC1234',
                prefixIcon: Icon(Icons.confirmation_number),
                border: OutlineInputBorder(),
              ),
              textCapitalization: TextCapitalization.characters,
              validator: (value) {
                if (value == null || value.trim().isEmpty) {
                  return 'Please enter the license plate';
                }
                return null;
              },
            ),
            const SizedBox(height: 16),

            // Notes (optional)
            TextFormField(
              controller: _notesController,
              decoration: const InputDecoration(
                labelText: 'Notes (Optional)',
                hintText: 'Any special instructions or notes',
                prefixIcon: Icon(Icons.notes),
                border: OutlineInputBorder(),
              ),
              maxLines: 3,
              textCapitalization: TextCapitalization.sentences,
            ),
            const SizedBox(height: 32),

            // Save Button
            SizedBox(
              height: 56,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _saveVehicle,
                style: ElevatedButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Text(
                        widget.vehicle == null ? 'Add Vehicle' : 'Save Changes',
                        style: const TextStyle(fontSize: 18),
                      ),
              ),
            ),

            if (widget.isFirstTimeSetup) ...[
              const SizedBox(height: 16),
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Skip for now'),
              ),
            ],
          ],
        ),
      ),
    );
  }

  String _formatVehicleType(VehicleType type) {
    return type.toString().split('.').last.replaceAll('_', ' ');
  }
}
