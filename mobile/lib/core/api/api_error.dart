import 'package:dio/dio.dart';

class ApiError implements Exception {
  final int? status;
  final String code;
  final String message;
  final Map<String, dynamic>? details;

  const ApiError({
    this.status,
    required this.code,
    required this.message,
    this.details,
  });

  factory ApiError.fromDioException(DioException err) {
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout ||
        err.type == DioExceptionType.connectionError) {
      return const ApiError(
        code: 'NETWORK_ERROR',
        message: 'Internet kamzor hai, dobara koshish karein',
      );
    }

    final res = err.response;
    final data = res?.data;
    if (data is Map<String, dynamic> && data['error'] is Map<String, dynamic>) {
      final errorObj = data['error'] as Map<String, dynamic>;
      return ApiError(
        status: res?.statusCode,
        code: (errorObj['code'] ?? 'UNKNOWN_ERROR').toString(),
        message: (errorObj['message'] ?? 'Kuch galat ho gaya').toString(),
        details: errorObj['details'] is Map<String, dynamic>
            ? errorObj['details'] as Map<String, dynamic>
            : null,
      );
    }

    if (res?.statusCode == 429) {
      return const ApiError(
        status: 429,
        code: 'RATE_LIMITED',
        message: 'Thodi der baad koshish karein',
      );
    }

    return ApiError(
      status: res?.statusCode,
      code: 'SERVER_ERROR',
      message: 'Server se sampark nahi ho pa raha hai',
    );
  }

  @override
  String toString() => 'ApiError($status, $code: $message)';
}