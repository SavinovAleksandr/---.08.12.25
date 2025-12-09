<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Получаем данные из POST запроса
$data = json_decode(file_get_contents('php://input'), true);

// Проверяем наличие обязательных полей
if (empty($data['phone']) || empty($data['email'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Пожалуйста, заполните все обязательные поля (телефон и email).'
    ]);
    exit;
}

// Получаем данные
$name = isset($data['name']) ? trim($data['name']) : 'не указано';
$phone = trim($data['phone']);
$email = trim($data['email']);
$purpose = isset($data['purpose']) ? trim($data['purpose']) : 'Заявка с сайта';

// Валидация email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Пожалуйста, введите корректный email адрес.'
    ]);
    exit;
}

// Настройки почты
$to = 'info@digital-tribe.ru';
$subject = '=?UTF-8?B?' . base64_encode($purpose) . '?=';

// Формируем тело письма
$message = "Новая заявка с сайта Олега Соловьёва:\n\n";
$message .= "Имя: " . $name . "\n";
$message .= "Телефон: " . $phone . "\n";
$message .= "E-mail: " . $email . "\n";
$message .= "\n---\n";
$message .= "Дата отправки: " . date('d.m.Y H:i:s') . "\n";
$message .= "IP адрес: " . ($_SERVER['REMOTE_ADDR'] ?? 'не определен');

// Заголовки письма
$headers = "From: noreply@digital-tribe.ru\r\n";
$headers .= "Reply-To: " . $email . "\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Отправляем письмо
$mailSent = mail($to, $subject, $message, $headers);

if ($mailSent) {
    echo json_encode([
        'success' => true,
        'message' => 'Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.'
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Произошла ошибка при отправке письма. Пожалуйста, попробуйте позже или свяжитесь с нами напрямую.'
    ]);
}
?>

