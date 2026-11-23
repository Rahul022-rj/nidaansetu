import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../core/auth/auth_controller.dart';
import '../features/auth/auth_screens.dart';
import '../features/patient/book_doctor_screen.dart';
import '../features/patient/book_test_screen.dart';
import '../features/patient/family_screen.dart';
import '../features/patient/my_bookings_screen.dart';
import '../features/patient/patient_home_screen.dart';
import '../features/patient/village_picker_screen.dart';
import '../features/staff/staff_screens.dart';

final routerProvider = Provider<GoRouter>((ref) {
  final auth = ref.watch(authProvider);

  return GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final loc = state.matchedLocation;
      if (!auth.isReady) return loc == '/splash' ? null : '/splash';

      final user = auth.user;
      final publicPaths = {'/', '/login/patient', '/login/staff', '/signup'};

      if (user == null) {
        return publicPaths.contains(loc) ? null : '/';
      }

      if (user.mustChangePassword) {
        return loc == '/change-password' ? null : '/change-password';
      }

      if (loc == '/splash' ||
          loc == '/change-password' ||
          publicPaths.contains(loc)) {
        return auth.homeRoute;
      }

      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => const SplashScreen()),
      GoRoute(path: '/', builder: (_, __) => const LandingScreen()),
      GoRoute(
        path: '/login/:portal',
        builder: (_, state) =>
            LoginScreen(portal: state.pathParameters['portal'] ?? 'patient'),
      ),
      GoRoute(path: '/signup', builder: (_, __) => const SignupScreen()),
      GoRoute(
        path: '/change-password',
        builder: (_, __) => const ChangePasswordScreen(),
      ),
      GoRoute(path: '/admin-web', builder: (_, __) => const AdminWebOnlyScreen()),
      GoRoute(path: '/home', builder: (_, __) => const PatientHomeScreen()),
      GoRoute(path: '/village', builder: (_, __) => const VillagePickerScreen()),
      GoRoute(path: '/book-test', builder: (_, __) => const BookTestScreen()),
      GoRoute(
        path: '/my-bookings',
        builder: (_, __) => const MyBookingsScreen(),
      ),
      GoRoute(path: '/family', builder: (_, __) => const FamilyScreen()),
      GoRoute(
        path: '/book-doctor',
        builder: (_, __) => const BookDoctorScreen(),
      ),
      GoRoute(
        path: '/my-appointments',
        builder: (_, __) => const MyAppointmentsScreen(),
      ),
      GoRoute(path: '/lab', builder: (_, __) => const LabQueueScreen()),
      GoRoute(path: '/doctor', builder: (_, __) => const DoctorQueueScreen()),
      GoRoute(
        path: '/agent',
        builder: (_, __) => const AgentOnboardingScreen(),
      ),
    ],
  );
});