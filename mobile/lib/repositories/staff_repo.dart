import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api/api_error.dart';
import '../core/auth/auth_controller.dart';
import '../core/utils/json_map.dart';

class StaffRepo {
  final Dio _dio;
  StaffRepo(this._dio);

  Future<List<JsonMap>> getLabBookings({String? status}) async {
    try {
      final res = await _dio.get(
        '/lab/bookings',
        queryParameters: {
          if (status != null && status.isNotEmpty) 'status': status,
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> confirmBooking(
    String bookingId, {
    required String collectionTime,
  }) async {
    try {
      await _dio.patch(
        '/lab/bookings/$bookingId/confirm',
        data: {'collectionTime': collectionTime.trim()},
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> collectBookingWithOtp(
    String bookingId, {
    required String otp,
    String? paymentMode,
  }) async {
    try {
      await _dio.patch(
        '/lab/bookings/$bookingId/collect',
        data: {
          'otp': otp.trim(),
          if (paymentMode != null && paymentMode.isNotEmpty)
            'paymentMode': paymentMode,
        },
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> rejectBooking(
    String bookingId, {
    String? reason,
  }) async {
    try {
      await _dio.patch(
        '/lab/bookings/$bookingId/reject',
        data: {
          if (reason != null && reason.trim().isNotEmpty)
            'reason': reason.trim(),
        },
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> uploadReportFile(
    String bookingId, {
    required String filePath,
    required String fileName,
  }) async {
    try {
      final formData = FormData.fromMap({
        'report': await MultipartFile.fromFile(filePath, filename: fileName),
      });
      await _dio.post(
        '/lab/bookings/$bookingId/report',
        data: formData,
        options: Options(contentType: 'multipart/form-data'),
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<List<JsonMap>> getDoctorAppointments({String? date}) async {
    try {
      final res = await _dio.get(
        '/doctor/appointments',
        queryParameters: {
          if (date != null && date.isNotEmpty) 'date': date,
        },
      );
      return asJsonMapList(res.data['data']);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<void> updateAppointmentStatus(
    String appointmentId, {
    required String status,
    String? notes,
  }) async {
    try {
      await _dio.patch(
        '/doctor/appointments/$appointmentId/status',
        data: {
          'status': status,
          if (notes != null && notes.trim().isNotEmpty) 'notes': notes.trim(),
        },
      );
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }

  Future<JsonMap> onboardPatient({
    required String name,
    required String phone,
    String? password,
    String? villageId,
  }) async {
    try {
      final res = await _dio.post(
        '/agent/patients',
        data: {
          'name': name.trim(),
          'phone': phone.trim(),
          if (password != null && password.trim().isNotEmpty)
            'password': password.trim(),
          if (villageId != null && villageId.isNotEmpty) 'villageId': villageId,
        },
      );
      final dataMap = asJsonMap(res.data);
      return asJsonMap(dataMap['user'] ?? dataMap['patient'] ?? dataMap);
    } on DioException catch (e) {
      throw ApiError.fromDioException(e);
    }
  }
}

final staffRepoProvider = Provider<StaffRepo>(
  (ref) => StaffRepo(ref.read(dioProvider)),
);