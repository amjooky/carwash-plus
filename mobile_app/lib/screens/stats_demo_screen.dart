import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../widgets/car_wash_charts.dart';
import '../widgets/themed_widgets.dart';
import '../widgets/water_drop_loader.dart';

/// Demo screen to showcase the new car wash themed UI components
class StatsDemoScreen extends StatelessWidget {
  const StatsDemoScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Wash Statistics'),
        backgroundColor: Colors.transparent,
      ),
      body: BubbleBackground(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Stats cards row
              Row(
                children: [
                  Expanded(
                    child: StatsCard(
                      title: 'Total Washes',
                      value: '24',
                      icon: Icons.local_car_wash,
                      color: AppTheme.primaryWater,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatsCard(
                      title: 'This Month',
                      value: '8',
                      icon: Icons.calendar_today,
                      color: AppTheme.successClean,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              Row(
                children: [
                  Expanded(
                    child: StatsCard(
                      title: 'Saved',
                      value: '\$120',
                      icon: Icons.savings_outlined,
                      color: AppTheme.sparkleClean,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: StatsCard(
                      title: 'Points',
                      value: '480',
                      icon: Icons.stars,
                      color: AppTheme.warningDirty,
                    ),
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Section header
              const SectionHeader(
                title: 'Completion Progress',
                icon: Icons.track_changes,
              ),
              
              // Bubble progress charts
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  Column(
                    children: const [
                      BubbleProgressChart(
                        progress: 0.75,
                        centerText: '75%',
                        size: 100,
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Weekly Goal',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.mediumText,
                        ),
                      ),
                    ],
                  ),
                  Column(
                    children: const [
                      BubbleProgressChart(
                        progress: 0.45,
                        centerText: '45%',
                        size: 100,
                        progressColor: AppTheme.successClean,
                      ),
                      SizedBox(height: 8),
                      Text(
                        'Monthly Goal',
                        style: TextStyle(
                          fontSize: 12,
                          color: AppTheme.mediumText,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Water level bar chart
              WaterLevelBarChart(
                title: 'Weekly Washes',
                height: 180,
                data: [
                  ChartData(label: 'Mon', value: 2, color: AppTheme.primaryWater),
                  ChartData(label: 'Tue', value: 1, color: AppTheme.secondaryBubble),
                  ChartData(label: 'Wed', value: 3, color: AppTheme.primaryWater),
                  ChartData(label: 'Thu', value: 0, color: AppTheme.lightText),
                  ChartData(label: 'Fri', value: 1, color: AppTheme.secondaryBubble),
                  ChartData(label: 'Sat', value: 4, color: AppTheme.successClean),
                  ChartData(label: 'Sun', value: 2, color: AppTheme.primaryWater),
                ],
              ),
              
              const SizedBox(height: 32),
              
              // Rating example
              const SectionHeader(
                title: 'Service Rating',
                icon: Icons.star_rate,
              ),
              WaterRippleCard(
                child: Column(
                  children: const [
                    CleanRatingWidget(rating: 4.5, size: 32),
                    SizedBox(height: 12),
                    Text(
                      'Excellent Service!',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: AppTheme.darkText,
                      ),
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Loader examples
              const SectionHeader(
                title: 'Loading Animations',
                icon: Icons.autorenew,
              ),
              WaterRippleCard(
                child: Column(
                  children: const [
                    Text(
                      'Water Drop Loader',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 16),
                    WaterDropLoader(size: 60),
                    SizedBox(height: 32),
                    Text(
                      'Spray Gun Loader',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 16),
                    SprayGunLoader(size: 80),
                    SizedBox(height: 32),
                    Text(
                      'Water Wave Loader',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    SizedBox(height: 16),
                    WaterWaveLoader(size: 60),
                  ],
                ),
              ),
              
              const SizedBox(height: 32),
              
              // Button examples
              const SectionHeader(
                title: 'Themed Buttons',
                icon: Icons.touch_app,
              ),
              WaterGradientButton(
                text: 'Book a Wash',
                icon: Icons.local_car_wash,
                onPressed: () {},
              ),
              const SizedBox(height: 16),
              WaterGradientButton(
                text: 'Loading...',
                isLoading: true,
                onPressed: null,
              ),
              
              const SizedBox(height: 32),
              
              // Status badges
              const SectionHeader(
                title: 'Status Badges',
                icon: Icons.label,
              ),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: const [
                  StatusBadge(
                    text: 'Confirmed',
                    color: AppTheme.successClean,
                    icon: Icons.check_circle,
                  ),
                  StatusBadge(
                    text: 'Pending',
                    color: AppTheme.warningDirty,
                    icon: Icons.schedule,
                  ),
                  StatusBadge(
                    text: 'In Progress',
                    color: AppTheme.infoProgress,
                    icon: Icons.autorenew,
                  ),
                  StatusBadge(
                    text: 'Cancelled',
                    color: AppTheme.errorDanger,
                    icon: Icons.cancel,
                  ),
                ],
              ),
              
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}
