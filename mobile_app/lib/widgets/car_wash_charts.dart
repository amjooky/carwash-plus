import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../theme/app_theme.dart';

/// Circular progress chart with bubble effects for car wash completion
class BubbleProgressChart extends StatefulWidget {
  final double progress; // 0.0 to 1.0
  final double size;
  final String? centerText;
  final Color? progressColor;
  
  const BubbleProgressChart({
    super.key,
    required this.progress,
    this.size = 120,
    this.centerText,
    this.progressColor,
  });

  @override
  State<BubbleProgressChart> createState() => _BubbleProgressChartState();
}

class _BubbleProgressChartState extends State<BubbleProgressChart>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 3000),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: [
              CustomPaint(
                size: Size(widget.size, widget.size),
                painter: BubbleProgressPainter(
                  progress: widget.progress,
                  bubbleAnimation: _controller.value,
                  progressColor: widget.progressColor ?? AppTheme.primaryWater,
                ),
              ),
              if (widget.centerText != null)
                Text(
                  widget.centerText!,
                  style: TextStyle(
                    fontSize: widget.size * 0.2,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.darkText,
                  ),
                ),
            ],
          );
        },
      ),
    );
  }
}

class BubbleProgressPainter extends CustomPainter {
  final double progress;
  final double bubbleAnimation;
  final Color progressColor;

  BubbleProgressPainter({
    required this.progress,
    required this.bubbleAnimation,
    required this.progressColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2 - 10;

    // Background circle
    final bgPaint = Paint()
      ..color = AppTheme.accentFoam
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;
    
    canvas.drawCircle(center, radius, bgPaint);

    // Progress arc
    final progressPaint = Paint()
      ..shader = LinearGradient(
        colors: [progressColor, AppTheme.sparkleClean],
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..style = PaintingStyle.stroke
      ..strokeWidth = 12
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -math.pi / 2,
      2 * math.pi * progress,
      false,
      progressPaint,
    );

    // Animated bubbles around the arc
    if (progress > 0) {
      final bubbleCount = (progress * 12).ceil();
      for (int i = 0; i < bubbleCount; i++) {
        final angle = -math.pi / 2 + (2 * math.pi * progress * i / bubbleCount);
        final bubblePhase = (bubbleAnimation + i * 0.1) % 1.0;
        
        final bubbleCenter = Offset(
          center.dx + math.cos(angle) * (radius + 8 * math.sin(bubblePhase * math.pi)),
          center.dy + math.sin(angle) * (radius + 8 * math.sin(bubblePhase * math.pi)),
        );

        final bubbleSize = 3 + 2 * math.sin(bubblePhase * math.pi);
        
        // Bubble with gradient
        final bubblePaint = Paint()
          ..shader = RadialGradient(
            colors: [
              Colors.white.withOpacity(0.8),
              progressColor.withOpacity(0.4),
            ],
          ).createShader(Rect.fromCircle(
            center: bubbleCenter,
            radius: bubbleSize,
          ));

        canvas.drawCircle(bubbleCenter, bubbleSize, bubblePaint);
      }
    }
  }

  @override
  bool shouldRepaint(covariant BubbleProgressPainter oldDelegate) {
    return oldDelegate.progress != progress ||
           oldDelegate.bubbleAnimation != bubbleAnimation;
  }
}

/// Bar chart for wash statistics with water level effect
class WaterLevelBarChart extends StatelessWidget {
  final List<ChartData> data;
  final double height;
  final String? title;
  
  const WaterLevelBarChart({
    super.key,
    required this.data,
    this.height = 200,
    this.title,
  });

  @override
  Widget build(BuildContext context) {
    final maxValue = data.map((e) => e.value).reduce(math.max);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (title != null)
          Padding(
            padding: const EdgeInsets.only(bottom: 16),
            child: Text(
              title!,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.darkText,
              ),
            ),
          ),
        SizedBox(
          height: height,
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: data.map((item) {
              final barHeight = (item.value / maxValue) * height;
              return Expanded(
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.end,
                    children: [
                      Text(
                        item.value.toStringAsFixed(0),
                        style: const TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: AppTheme.mediumText,
                        ),
                      ),
                      const SizedBox(height: 4),
                      WaterLevelBar(
                        height: barHeight,
                        color: item.color ?? AppTheme.primaryWater,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        item.label,
                        style: const TextStyle(
                          fontSize: 11,
                          color: AppTheme.mediumText,
                        ),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
              );
            }).toList(),
          ),
        ),
      ],
    );
  }
}

class WaterLevelBar extends StatefulWidget {
  final double height;
  final Color color;
  
  const WaterLevelBar({
    super.key,
    required this.height,
    required this.color,
  });

  @override
  State<WaterLevelBar> createState() => _WaterLevelBarState();
}

class _WaterLevelBarState extends State<WaterLevelBar>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 500),
      curve: Curves.easeOut,
      height: widget.height,
      width: double.infinity,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(8),
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            widget.color.withOpacity(0.6),
            widget.color,
          ],
        ),
        boxShadow: AppTheme.defaultCardShadow,
      ),
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return CustomPaint(
            painter: WaterWavePainter(
              waveProgress: _controller.value,
              color: widget.color,
            ),
          );
        },
      ),
    );
  }
}

class WaterWavePainter extends CustomPainter {
  final double waveProgress;
  final Color color;

  WaterWavePainter({
    required this.waveProgress,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final path = Path();
    final waveHeight = 4.0;
    
    path.moveTo(0, waveHeight);
    
    for (double x = 0; x <= size.width; x++) {
      final y = waveHeight * 
          math.sin((x / size.width * 2 * math.pi) + (waveProgress * 2 * math.pi));
      path.lineTo(x, y);
    }
    
    path.lineTo(size.width, size.height);
    path.lineTo(0, size.height);
    path.close();

    final wavePaint = Paint()
      ..color = Colors.white.withOpacity(0.3);
    
    canvas.drawPath(path, wavePaint);
  }

  @override
  bool shouldRepaint(covariant WaterWavePainter oldDelegate) {
    return oldDelegate.waveProgress != waveProgress;
  }
}

/// Data model for charts
class ChartData {
  final String label;
  final double value;
  final Color? color;

  ChartData({
    required this.label,
    required this.value,
    this.color,
  });
}

/// Sparkle/Clean rating widget
class CleanRatingWidget extends StatelessWidget {
  final double rating; // 0.0 to 5.0
  final double size;
  
  const CleanRatingWidget({
    super.key,
    required this.rating,
    this.size = 24,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final filled = rating >= index + 1;
        final partial = rating > index && rating < index + 1;
        
        return Icon(
          Icons.water_drop,
          size: size,
          color: filled || partial
              ? AppTheme.sparkleClean
              : AppTheme.lightText,
        );
      }),
    );
  }
}

/// Mini stats card with icon and value
class StatsCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color? color;
  
  const StatsCard({
    super.key,
    required this.title,
    required this.value,
    required this.icon,
    this.color,
  });

  @override
  Widget build(BuildContext context) {
    final cardColor = color ?? AppTheme.primaryWater;
    
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            cardColor.withOpacity(0.1),
            cardColor.withOpacity(0.05),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: cardColor.withOpacity(0.2),
          width: 1,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(
            icon,
            color: cardColor,
            size: 32,
          ),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 24,
              fontWeight: FontWeight.bold,
              color: cardColor,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            title,
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.mediumText,
            ),
          ),
        ],
      ),
    );
  }
}
