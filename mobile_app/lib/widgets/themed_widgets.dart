import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

/// Gradient button with water theme
class WaterGradientButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final IconData? icon;
  final bool isLoading;
  final bool fullWidth;
  
  const WaterGradientButton({
    super.key,
    required this.text,
    this.onPressed,
    this.icon,
    this.isLoading = false,
    this.fullWidth = true,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: fullWidth ? double.infinity : null,
      child: Container(
        decoration: BoxDecoration(
          gradient: AppTheme.waterGradient,
          borderRadius: BorderRadius.circular(12),
          boxShadow: AppTheme.defaultCardShadow,
        ),
        child: ElevatedButton(
          onPressed: isLoading ? null : onPressed,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            shadowColor: Colors.transparent,
            padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          child: isLoading
              ? const SizedBox(
                  height: 20,
                  width: 20,
                  child: CircularProgressIndicator(
                    color: Colors.white,
                    strokeWidth: 2,
                  ),
                )
              : Row(
                  mainAxisSize: MainAxisSize.min,
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    if (icon != null) ...[
                      Icon(icon, size: 20),
                      const SizedBox(width: 8),
                    ],
                    Text(
                      text,
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ],
                ),
        ),
      ),
    );
  }
}

/// Status badge with car wash theme colors
class StatusBadge extends StatelessWidget {
  final String text;
  final Color? color;
  final IconData? icon;
  
  const StatusBadge({
    super.key,
    required this.text,
    this.color,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    final badgeColor = color ?? AppTheme.primaryWater;
    
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: badgeColor.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: badgeColor.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 14, color: badgeColor),
            const SizedBox(width: 4),
          ],
          Text(
            text,
            style: TextStyle(
              color: badgeColor,
              fontWeight: FontWeight.bold,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}

/// Animated card with water ripple effect on tap
class WaterRippleCard extends StatefulWidget {
  final Widget child;
  final VoidCallback? onTap;
  final EdgeInsets? padding;
  final double? elevation;
  
  const WaterRippleCard({
    super.key,
    required this.child,
    this.onTap,
    this.padding,
    this.elevation,
  });

  @override
  State<WaterRippleCard> createState() => _WaterRippleCardState();
}

class _WaterRippleCardState extends State<WaterRippleCard>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isPressed = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedScale(
      scale: _isPressed ? 0.98 : 1.0,
      duration: const Duration(milliseconds: 100),
      child: Card(
        elevation: widget.elevation ?? 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
        ),
        child: InkWell(
          onTap: widget.onTap,
          onTapDown: (_) => setState(() => _isPressed = true),
          onTapUp: (_) => setState(() => _isPressed = false),
          onTapCancel: () => setState(() => _isPressed = false),
          borderRadius: BorderRadius.circular(16),
          splashColor: AppTheme.secondaryBubble.withOpacity(0.3),
          highlightColor: AppTheme.accentFoam,
          child: Padding(
            padding: widget.padding ?? const EdgeInsets.all(16),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}

/// Info row with icon and text (for details)
class InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final Color? iconColor;
  
  const InfoRow({
    super.key,
    required this.icon,
    required this.text,
    this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(
          icon,
          size: 16,
          color: iconColor ?? AppTheme.mediumText,
        ),
        const SizedBox(width: 8),
        Expanded(
          child: Text(
            text,
            style: const TextStyle(
              color: AppTheme.mediumText,
              fontSize: 14,
            ),
          ),
        ),
      ],
    );
  }
}

/// Shimmer loading effect for cards
class ShimmerLoading extends StatefulWidget {
  final double width;
  final double height;
  final BorderRadius? borderRadius;
  
  const ShimmerLoading({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius,
  });

  @override
  State<ShimmerLoading> createState() => _ShimmerLoadingState();
}

class _ShimmerLoadingState extends State<ShimmerLoading>
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
    return AnimatedBuilder(
      animation: _controller,
      builder: (context, child) {
        return Container(
          width: widget.width,
          height: widget.height,
          decoration: BoxDecoration(
            borderRadius: widget.borderRadius ?? BorderRadius.circular(8),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppTheme.accentFoam,
                AppTheme.secondaryBubble.withOpacity(0.3),
                AppTheme.accentFoam,
              ],
              stops: [
                _controller.value - 0.3,
                _controller.value,
                _controller.value + 0.3,
              ].map((e) => e.clamp(0.0, 1.0)).toList(),
            ),
          ),
        );
      },
    );
  }
}

/// Empty state widget with water theme
class EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final Widget? action;
  
  const EmptyState({
    super.key,
    required this.icon,
    required this.title,
    this.subtitle,
    this.action,
  });

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(32),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: LinearGradient(
                  colors: [
                    AppTheme.accentFoam,
                    AppTheme.secondaryBubble.withOpacity(0.2),
                  ],
                ),
              ),
              child: Icon(
                icon,
                size: 64,
                color: AppTheme.primaryWater.withOpacity(0.6),
              ),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: AppTheme.darkText,
              ),
              textAlign: TextAlign.center,
            ),
            if (subtitle != null) ...[
              const SizedBox(height: 8),
              Text(
                subtitle!,
                style: const TextStyle(
                  fontSize: 14,
                  color: AppTheme.mediumText,
                ),
                textAlign: TextAlign.center,
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 24),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Price tag widget
class PriceTag extends StatelessWidget {
  final String price;
  final bool isLarge;
  
  const PriceTag({
    super.key,
    required this.price,
    this.isLarge = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: EdgeInsets.symmetric(
        horizontal: isLarge ? 16 : 12,
        vertical: isLarge ? 8 : 6,
      ),
      decoration: BoxDecoration(
        gradient: AppTheme.waterGradient,
        borderRadius: BorderRadius.circular(isLarge ? 12 : 8),
        boxShadow: AppTheme.waterDropShadow,
      ),
      child: Text(
        price,
        style: TextStyle(
          fontSize: isLarge ? 24 : 18,
          fontWeight: FontWeight.bold,
          color: Colors.white,
        ),
      ),
    );
  }
}

/// Section header with icon
class SectionHeader extends StatelessWidget {
  final String title;
  final IconData? icon;
  final Widget? trailing;
  
  const SectionHeader({
    super.key,
    required this.title,
    this.icon,
    this.trailing,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 16),
      child: Row(
        children: [
          if (icon != null) ...[
            Icon(
              icon,
              color: AppTheme.primaryWater,
              size: 24,
            ),
            const SizedBox(width: 12),
          ],
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 20,
                fontWeight: FontWeight.bold,
                color: AppTheme.darkText,
              ),
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}

/// Bubble background decoration
class BubbleBackground extends StatefulWidget {
  final Widget child;
  
  const BubbleBackground({
    super.key,
    required this.child,
  });

  @override
  State<BubbleBackground> createState() => _BubbleBackgroundState();
}

class _BubbleBackgroundState extends State<BubbleBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 20),
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Bubble background
        Positioned.fill(
          child: CustomPaint(
            painter: BubbleBackgroundPainter(
              animation: _controller,
            ),
          ),
        ),
        // Content
        widget.child,
      ],
    );
  }
}

class BubbleBackgroundPainter extends CustomPainter {
  final Animation<double> animation;
  
  BubbleBackgroundPainter({required this.animation}) : super(repaint: animation);

  @override
  void paint(Canvas canvas, Size size) {
    final bubbles = [
      {'x': 0.1, 'y': 0.2, 'size': 60.0, 'speed': 1.0},
      {'x': 0.8, 'y': 0.7, 'size': 80.0, 'speed': 0.8},
      {'x': 0.3, 'y': 0.5, 'size': 40.0, 'speed': 1.2},
      {'x': 0.7, 'y': 0.3, 'size': 50.0, 'speed': 0.9},
      {'x': 0.5, 'y': 0.8, 'size': 70.0, 'speed': 1.1},
    ];

    for (var bubble in bubbles) {
      final x = size.width * (bubble['x'] as double);
      final baseY = size.height * (bubble['y'] as double);
      final speed = bubble['speed'] as double;
      final offset = 20 * (animation.value * speed % 1.0);
      final y = baseY + offset;
      
      final bubbleSize = bubble['size'] as double;
      
      final paint = Paint()
        ..shader = RadialGradient(
          colors: [
            AppTheme.secondaryBubble.withOpacity(0.1),
            AppTheme.accentFoam.withOpacity(0.05),
          ],
        ).createShader(Rect.fromCircle(
          center: Offset(x, y),
          radius: bubbleSize,
        ));
      
      canvas.drawCircle(Offset(x, y), bubbleSize, paint);
    }
  }

  @override
  bool shouldRepaint(covariant BubbleBackgroundPainter oldDelegate) {
    return true;
  }
}
