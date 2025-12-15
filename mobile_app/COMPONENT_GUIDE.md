# CarWash+ Component Visual Guide 🎨

Quick visual reference for all the new car wash themed components.

## 🌊 Color Palette

```
Primary Water:     ███ #0EA5E9  (Sky blue - main brand)
Secondary Bubble:  ███ #38BDF8  (Light blue - accents)
Accent Foam:       ███ #F0F9FF  (Very light blue - backgrounds)
Sparkle Clean:     ███ #22D3EE  (Cyan - highlights)
Deep Water:        ███ #0369A1  (Deep blue - dark accents)

Success Clean:     ███ #10B981  (Green - completed)
Warning Dirty:     ███ #F59E0B  (Orange - pending)
Info Progress:     ███ #3B82F6  (Blue - in progress)
Error Danger:      ███ #EF4444  (Red - error/cancelled)
```

## 💧 Loaders

### WaterDropLoader
```
     ○
   ○   ○
     ●
```
**Description**: 3 rotating water droplets with pulsing animation
**Use for**: Main loading states, splash screen
**Code**: `WaterDropLoader(size: 80)`

### SprayGunLoader  
```
    ╱▔▔▔╲  • • •
   ╱     ▔▔▔╲  • • •
  └─────┘     • • •
```
**Description**: Spray gun with animated particle spray
**Use for**: Booking/service screens, active wash status
**Code**: `SprayGunLoader(size: 100)`

### WaterWaveLoader
```
   ◯
  ◯ ◯
 ◯   ◯
```
**Description**: Expanding ripple circles
**Use for**: Background operations, subtle loading
**Code**: `WaterWaveLoader(size: 60)`

## 📊 Charts & Stats

### BubbleProgressChart
```
      75%
   ●○○○○○○○●
  ●          ●
 ●            ●
  ●          ●
   ●○○○○○○●
```
**Description**: Circular progress with animated bubbles
**Shows**: Percentage completion with bubble trail
**Code**:
```dart
BubbleProgressChart(
  progress: 0.75,
  centerText: '75%',
  size: 120,
)
```

### WaterLevelBarChart
```
  8  │     ╔═══╗
  6  │ ╔═══╣~~~╠═══╗
  4  │ ║~~~║~~~║~~~║
  2  │ ║~~~║~~~║~~~║
     └─┴─┴─┴─┴─┴─┴─
       M T W T F S S
```
**Description**: Bar chart with water wave animation on top
**Shows**: Daily/weekly statistics
**Code**:
```dart
WaterLevelBarChart(
  title: 'Weekly Washes',
  data: [ChartData(...)],
)
```

### StatsCard
```
╔════════════════╗
║  🚗            ║
║                ║
║  24            ║
║  Total Washes  ║
╚════════════════╝
```
**Description**: Mini stats display with gradient background
**Shows**: Key metrics with icon
**Code**:
```dart
StatsCard(
  title: 'Total Washes',
  value: '24',
  icon: Icons.local_car_wash,
)
```

### CleanRatingWidget
```
💧 💧 💧 💧 ○
```
**Description**: 5-star rating using water droplets
**Shows**: Service quality rating
**Code**: `CleanRatingWidget(rating: 4.5)`

## 🎯 Buttons & Actions

### WaterGradientButton
```
╔═══════════════════════╗
║ ░▒▓ Book a Wash █▓▒░  ║ (gradient blue)
╚═══════════════════════╝
```
**Description**: Primary action button with water gradient
**Use for**: Main CTAs, important actions
**Code**:
```dart
WaterGradientButton(
  text: 'Book a Wash',
  icon: Icons.local_car_wash,
  onPressed: () {},
)
```

### Loading State
```
╔═══════════════════════╗
║        ⟳ Loading...   ║ (gradient blue)
╚═══════════════════════╝
```
**Code**: `WaterGradientButton(isLoading: true, ...)`

## 🏷️ Status & Labels

### StatusBadge
```
┌─────────────┐
│ ✓ Confirmed │ (green with border)
└─────────────┘
```
**Variants**:
- ✓ Confirmed (green)
- ⏰ Pending (orange)
- ⟳ In Progress (blue)
- ✕ Cancelled (red)

**Code**:
```dart
StatusBadge(
  text: 'Confirmed',
  color: AppTheme.successClean,
  icon: Icons.check_circle,
)
```

### PriceTag
```
┌──────────┐
│  $25.00  │ (gradient blue, white text)
└──────────┘
```
**Description**: Styled price display with gradient
**Code**: `PriceTag(price: '\$25.00')`

## 📦 Cards & Containers

### WaterRippleCard
```
╔═════════════════════════╗
║                         ║
║   [Your Content Here]   ║
║                         ║
╚═════════════════════════╝
  (tap for ripple effect)
```
**Description**: Interactive card with water ripple on tap
**Features**: Scale animation, water-colored ripple
**Code**:
```dart
WaterRippleCard(
  onTap: () {},
  child: YourContent(),
)
```

### BubbleBackground
```
     ○        ○
  ○      ○        ○
       ○     ○
  ○        ○     ○
     [Your Screen Content]
```
**Description**: Animated floating bubbles in background
**Use for**: Full screen decoration
**Code**: `BubbleBackground(child: ...)`

## 📄 Content Elements

### SectionHeader
```
🔧 Recent Activity
─────────────────────────
```
**Code**:
```dart
SectionHeader(
  title: 'Recent Activity',
  icon: Icons.history,
)
```

### InfoRow
```
📅  Monday, Jan 15
```
**Code**:
```dart
InfoRow(
  icon: Icons.calendar_today,
  text: 'Monday, Jan 15',
)
```

### EmptyState
```
        ○
       ○○○
      ○ 🚫 ○
       ○○○
        ○

  No bookings yet
  
  Book your first wash!
  
  ┌───────────┐
  │   Book    │
  └───────────┘
```
**Code**:
```dart
EmptyState(
  icon: Icons.event_busy,
  title: 'No bookings yet',
  subtitle: 'Book your first wash!',
  action: WaterGradientButton(...),
)
```

## 🎬 Animation States

### ShimmerLoading
```
▒▒▒▒░░░░▓▓▓▓▒▒▒▒  →  ▓▓▓▓▒▒▒▒░░░░▓▓▓▓
(animated shimmer effect)
```
**Use for**: Loading placeholders
**Code**:
```dart
ShimmerLoading(
  width: 200,
  height: 100,
)
```

## 🎨 Common Patterns

### Stats Grid
```
╔══════════╗  ╔══════════╗
║ 🚗  24   ║  ║ 📅  8    ║
║ Washes   ║  ║ Month    ║
╚══════════╝  ╚══════════╝
╔══════════╗  ╔══════════╗
║ 💰 $120  ║  ║ ⭐ 480   ║
║ Saved    ║  ║ Points   ║
╚══════════╝  ╚══════════╝
```

### Progress Display
```
   75%              45%
 ●○○○○○●        ●○○○○○●
●        ●      ●        ●
●        ●      ●        ●
 ●○○○○○●        ●○○○○○●
Weekly Goal    Monthly Goal
```

### Status Row
```
┌──────────┐ ┌──────────┐ ┌──────────┐
│✓Confirmed│ │⏰Pending │ │⟳Progress │
└──────────┘ └──────────┘ └──────────┘
```

## 🎯 Usage Matrix

| Component | Loading | Display | Input | Action |
|-----------|---------|---------|-------|--------|
| WaterDropLoader | ✓ | | | |
| SprayGunLoader | ✓ | | | |
| WaterWaveLoader | ✓ | | | |
| BubbleProgressChart | | ✓ | | |
| WaterLevelBarChart | | ✓ | | |
| StatsCard | | ✓ | | |
| WaterGradientButton | | | | ✓ |
| StatusBadge | | ✓ | | |
| PriceTag | | ✓ | | |
| WaterRippleCard | | ✓ | | ✓ |
| EmptyState | | ✓ | | |

## 🌟 Best Combinations

### Booking Card
```
╔═══════════════════════════╗
║ Sparkle Car Wash          ║
║ ┌──────────┐              ║
║ │✓Confirmed│              ║
║ └──────────┘              ║
║ 📅 Mon, Jan 15 at 2:00 PM ║
║ 🚗 Sedan                  ║
║                           ║
║ ┌─────────┐        Cancel ║
║ │ $25.00  │               ║
║ └─────────┘               ║
╚═══════════════════════════╝
```

### Stats Dashboard
```
╔══════════╗  ╔══════════╗
║ 🚗  24   ║  ║ 📅  8    ║
╚══════════╝  ╚══════════╝

   75%              45%
 ●○○○○○●        ●○○○○○●

Weekly Washes
║█│█│███│█│████│███
M T W T F S S
```

## 📱 Screen Examples

### Splash Screen
```
        ○○○
       ○░▒▓○
      ○▒▓█▓▒○
       ○▓▒░○
        ○○○
        🚗

    CarWash+
  Shine On The Go

       ○ ○ ○
      ○     ○
       (rotating)
```

### Loading State
```
     Content Above
     
         ○
       ○   ○
         ○
    (water drops)
    
     Content Below
```

## 💡 Tips

1. **Consistency**: Always use themed components
2. **Colors**: Reference AppTheme colors, never hardcode
3. **Loading**: Use appropriate loader for context
4. **Feedback**: Cards should have tap effects
5. **Status**: Use consistent badge colors

---

**All components are ready to use! Import and enjoy the water-themed experience! 💧**
