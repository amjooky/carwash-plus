import 'package:flutter/material.dart';
import '../models/bay_availability.dart';

class BayGrid extends StatelessWidget {
  final List<Bay> bays;
  final Function(Bay) onBayTap;
  final int? selectedBay;

  const BayGrid({
    Key? key,
    required this.bays,
    required this.onBayTap,
    this.selectedBay,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GridView.builder(
      shrinkWrap: true,
      physics: NeverScrollableScrollPhysics(),
      gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 4,
        crossAxisSpacing: 8,
        mainAxisSpacing: 8,
        childAspectRatio: 1,
      ),
      itemCount: bays.length,
      itemBuilder: (context, index) {
        final bay = bays[index];
        final isSelected = selectedBay == bay.bayNumber;
        return _BayTile(
          bay: bay,
          isSelected: isSelected,
          onTap: () => onBayTap(bay),
        );
      },
    );
  }
}

class _BayTile extends StatelessWidget {
  final Bay bay;
  final bool isSelected;
  final VoidCallback onTap;

  const _BayTile({
    Key? key,
    required this.bay,
    required this.isSelected,
    required this.onTap,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final Color color;
    final Color bgColor;
    final IconData icon;

    if (isSelected) {
      color = Color(0xFF0EA5E9);
      bgColor = Color(0xFF0EA5E9).withOpacity(0.1);
      icon = Icons.check_circle;
    } else if (bay.isAvailable) {
      color = Colors.green;
      bgColor = Colors.green[50]!;
      icon = Icons.check_circle;
    } else {
      color = Colors.blue;
      bgColor = Colors.blue[50]!;
      icon = Icons.directions_car;
    }

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: color,
            width: isSelected ? 3 : 2,
          ),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              icon,
              color: color,
              size: 28,
            ),
            SizedBox(height: 4),
            Text(
              '${bay.bayNumber}',
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 16,
                color: color,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
