import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../theme/app_theme.dart';

/// Animated water drop loader - represents water droplets or spray effect
class WaterDropLoader extends StatefulWidget {
  final double size;
  final Color? color;
  
  const WaterDropLoader({
    super.key,
    this.size = 80,
    this.color,
  });

  @override
  State<WaterDropLoader> createState() => _WaterDropLoaderState();
}

class _WaterDropLoaderState extends State<WaterDropLoader>
    with TickerProviderStateMixin {
  late AnimationController _controller;
  late AnimationController _pulseController;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat();
    
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: Listenable.merge([_controller, _pulseController]),
        builder: (context, child) {
          return CustomPaint(
            painter: WaterDropPainter(
              progress: _controller.value,
              pulse: _pulseController.value,
              color: widget.color ?? AppTheme.primaryWater,
            ),
          );
        },
      ),
    );
  }
}

class WaterDropPainter extends CustomPainter {
  final double progress;
  final double pulse;
  final Color color;

  WaterDropPainter({
    required this.progress,
    required this.pulse,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = size.width / 2;

    // Draw three water drops rotating
    for (int i = 0; i < 3; i++) {
      final angle = (progress * 2 * math.pi) + (i * 2 * math.pi / 3);
      final dropCenter = Offset(
        center.dx + math.cos(angle) * radius * 0.4,
        center.dy + math.sin(angle) * radius * 0.4,
      );

      // Drop shadow
      final shadowPaint = Paint()
        ..color = color.withOpacity(0.2)
        ..maskFilter = const MaskFilter.blur(BlurStyle.normal, 4);
      
      canvas.drawCircle(
        dropCenter + const Offset(2, 2),
        radius * 0.18 * (1 + pulse * 0.2),
        shadowPaint,
      );

      // Main drop with gradient effect
      final dropPaint = Paint()
        ..shader = RadialGradient(
          colors: [
            Colors.white,
            color.withOpacity(0.8),
            color,
          ],
          stops: const [0.0, 0.5, 1.0],
        ).createShader(Rect.fromCircle(
          center: dropCenter,
          radius: radius * 0.2,
        ));

      canvas.drawCircle(
        dropCenter,
        radius * 0.18 * (1 + pulse * 0.2),
        dropPaint,
      );

      // Highlight
      final highlightPaint = Paint()
        ..color = Colors.white.withOpacity(0.6);
      canvas.drawCircle(
        dropCenter - Offset(radius * 0.06, radius * 0.06),
        radius * 0.06,
        highlightPaint,
      );
    }

    // Center spray gun effect (optional)
    final sprayPaint = Paint()
      ..color = color.withOpacity(0.3)
      ..style = PaintingStyle.stroke
      ..strokeWidth = 2;
    
    canvas.drawCircle(
      center,
      radius * 0.6 * (1 - pulse * 0.2),
      sprayPaint,
    );
  }

  @override
  bool shouldRepaint(covariant WaterDropPainter oldDelegate) {
    return oldDelegate.progress != progress || 
           oldDelegate.pulse != pulse;
  }
}

/// Alternative: Spray gun loader
class SprayGunLoader extends StatefulWidget {
  final double size;
  final Color? color;
  
  const SprayGunLoader({
    super.key,
    this.size = 100,
    this.color,
  });

  @override
  State<SprayGunLoader> createState() => _SprayGunLoaderState();
}

class _SprayGunLoaderState extends State<SprayGunLoader>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1500),
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
          return CustomPaint(
            painter: SprayGunPainter(
              progress: _controller.value,
              color: widget.color ?? AppTheme.primaryWater,
            ),
          );
        },
      ),
    );
  }
}

class SprayGunPainter extends CustomPainter {
  final double progress;
  final Color color;

  SprayGunPainter({
    required this.progress,
    required this.color,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);

    // Draw spray gun handle (simplified icon)
    final gunPaint = Paint()
      ..color = AppTheme.darkText
      ..style = PaintingStyle.stroke
      ..strokeWidth = 3
      ..strokeCap = StrokeCap.round;

    final gunPath = Path()
      ..moveTo(center.dx - 15, center.dy + 10)
      ..lineTo(center.dx - 15, center.dy - 5)
      ..lineTo(center.dx + 5, center.dy - 5)
      ..lineTo(center.dx + 15, center.dy - 15);

    canvas.drawPath(gunPath, gunPaint);

    // Draw animated water spray particles
    final random = math.Random(42);
    for (int i = 0; i < 8; i++) {
      final particleProgress = (progress + i * 0.125) % 1.0;
      final angle = -math.pi / 4 + (random.nextDouble() - 0.5) * 0.5;
      final distance = particleProgress * size.width * 0.4;
      
      final particlePos = Offset(
        center.dx + 15 + math.cos(angle) * distance,
        center.dy - 15 + math.sin(angle) * distance,
      );

      final particleSize = (1 - particleProgress) * 4;
      final particlePaint = Paint()
        ..color = color.withOpacity((1 - particleProgress) * 0.8);

      canvas.drawCircle(particlePos, particleSize, particlePaint);
    }
  }

  @override
  bool shouldRepaint(covariant SprayGunPainter oldDelegate) {
    return oldDelegate.progress != progress;
  }
}

/// Simple circular water wave loader
class WaterWaveLoader extends StatefulWidget {
  final double size;
  final Color? color;
  
  const WaterWaveLoader({
    super.key,
    this.size = 80,
    this.color,
  });

  @override
  State<WaterWaveLoader> createState() => _WaterWaveLoaderState();
}

class _WaterWaveLoaderState extends State<WaterWaveLoader>
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
    return SizedBox(
      width: widget.size,
      height: widget.size,
      child: AnimatedBuilder(
        animation: _controller,
        builder: (context, child) {
          return Stack(
            alignment: Alignment.center,
            children: List.generate(3, (index) {
              final delay = index * 0.33;
              final waveProgress = ((_controller.value + delay) % 1.0);
              
              return Container(
                width: widget.size * waveProgress,
                height: widget.size * waveProgress,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: (widget.color ?? AppTheme.primaryWater)
                        .withOpacity(1 - waveProgress),
                    width: 2,
                  ),
                ),
              );
            }),
          );
        },
      ),
    );
  }
}
