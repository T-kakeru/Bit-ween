export const ERROR_MESSAGES = {
  SYSTEM: {
    DB_NOT_CONFIGURED: "DB接続が未設定です",
    DB_NOT_CONFIGURED_DOT: "DB接続が未設定です。",
    DB_NOT_CONFIGURED_SUPABASE_ENV: "DB接続が未設定です（Supabase環境変数を確認してください）",
    SUPABASE_NOT_CONFIGURED_CREATE_EMPLOYEE:
      "Supabase が未設定のため、DBへ登録できません（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を確認してください）。",
    SUPABASE_NOT_CONFIGURED_UPDATE_EMPLOYEE:
      "Supabase が未設定のため、DBへ更新できません（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を確認してください）。",
    DATE_FORMAT_INVALID: "日付の形式が正しくありません",
    UPDATE_FAILED_GENERIC: "更新に失敗しました",
  },

  AUTH: {
    INVALID_CREDENTIALS: "メールアドレスまたはパスワードが間違っています",
    USERS_FETCH_FAILED: "DBからユーザー情報を取得できませんでした（接続設定・RLSを確認）",
    EMAIL_REQUIRED: "メールアドレスを入力してください",
    EMAIL_REQUIRED_ZOD: "メールアドレスは必須です",
    EMAIL_FORMAT_REQUIRED: "メールアドレス形式で入力してください",
    PASSWORD_REQUIRED: "パスワードを入力してください",
    PASSWORD_REQUIRED_ZOD: "パスワードは必須です",
    AUTO_LOGIN_FAILED: "自動ログインに失敗しました",
    AUTO_LOGIN_SUPABASE_NOT_CONFIGURED:
      "Supabase未設定のため自動ログインできません（VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY を確認）",
    PASSWORD_MIN_8: "パスワードは8文字以上で入力してください",
    CONFIRM_PASSWORD_REQUIRED: "確認用パスワードは必須です",
    PASSWORD_MISMATCH: "パスワードが一致しません",
    REQUEST_PASSWORD_RESET_FAILED: "送信に失敗しました",
    PASSWORD_UPDATE_FAILED: "パスワード更新に失敗しました",
  },

  EMPLOYEE: {
    EMPLOYEE_ID_REQUIRED: "社員IDが未入力です",
    UPDATE_TARGET_EMPLOYEE_ID_REQUIRED: "更新対象の社員IDが未設定です",
    NAME_REQUIRED: "氏名が未入力です",
    DEPARTMENT_REQUIRED: "部署が未選択です",
    WORK_STATUS_REQUIRED: "稼働状態が未選択です",
    CREATE_FAILED: "従業員の登録に失敗しました",
    CREATE_RESULT_FETCH_FAILED: "登録結果の取得に失敗しました",
    UPDATE_FAILED: "従業員の更新に失敗しました",
    UPDATE_RESULT_FETCH_FAILED: "更新結果の取得に失敗しました",
    IMPORT_NO_DATA: "取り込み対象のデータがありません。",
    UI_CREATE_FAILED_DOT: "社員情報の登録に失敗しました。",
  },

  SYSTEM_USERS: {
    INVALID_EMAIL: "メールアドレスの形式が正しくありません",
    INVALID_ROLE: "role は admin / general のみです",
    EMAIL_FORMAT_CHECK_DOT: "メールアドレスの形式を確認してください。",
    ROLE_SELECT_ADMIN_GENERAL_DOT: "権限は Admin または General を選択してください。",
    EMPLOYEE_INFO_NOT_SET_DOT: "社員情報が未設定です。",
    REGISTER_FAILED_DOT: "登録に失敗しました。",
    PASSWORD_REQUIRED: "パスワードが未入力です",
    EMAIL_DUPLICATE: "同一テナント内で email が重複しています",
    USER_NOT_FOUND: "対象ユーザーが見つかりません",
    ACCOUNT_NOT_FOUND: "対象アカウントが見つかりません",
    EMPLOYEE_CODE_NOT_FOUND: "社員ID(社員コード)がDB上で見つかりません",
    SELECT_ROW_TO_EDIT: "編集する行を選択してください。",
    NO_CHANGES: "変更がありません。",
    PASSWORD_RESET_FAILED: "パスワードリセットに失敗しました",
    DELETE_FAILED: "削除に失敗しました",
    ACCOUNT_REGISTER_FAILED: "アカウント登録に失敗しました",
  },

  MASTER: {
    NAME_REQUIRED: "名称は必須です",
    WORK_STATUS_IMMUTABLE: "稼働状態は固定データのため変更できません",
    INVALID_KEY_NAME: "不正なkeyNameです",
    PREV_NAME_INVALID: "変更前の名称が不正です",
    DATA_NOT_FOUND: "対象のデータが見つかりません",
    NAME_ALREADY_EXISTS: "同じ名称が既に存在します",
  },

  CATALOG: {
    CLIENT_NAME_REQUIRED_DOT: "稼働先名を入力してください。",
    CLIENT_CREATE_FAILED_DOT: "稼働先の登録に失敗しました。",
    DEPARTMENT_NAME_REQUIRED_DOT: "部署名を入力してください。",
    DEPARTMENT_CREATE_FAILED_DOT: "部署の登録に失敗しました。",
  },

  VALIDATION: {
    EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_DATE: "在籍の場合は退職日を入力しないでください",
    EMPLOYMENT_STATUS_ACTIVE_DISALLOW_RETIRE_REASON: "在籍の場合は退職理由を入力しないでください",
    EMPLOYMENT_STATUS_ACTIVE_DISALLOW_REMARK: "在籍の場合は備考を入力しないでください",
    EMPLOYMENT_STATUS_INVALID: "在籍状態は『在籍』または『退職』を入力してください",
  },

  CSV: {
    HEADER_NOT_FOUND_DOT: "CSVのヘッダーが見つかりません。",
    READ_FAILED_DOT: "CSVの読み込みに失敗しました。",
    READ_FAILED_WITH_HINT_DOT: "CSVの読み込みに失敗しました。ファイル形式を確認してください。",
    IMPORT_FAILED_DOT: "CSVの取り込みに失敗しました。",
    IMPORT_ERROR: "CSVの取り込み中にエラーが発生しました。",

    EMPLOYEE: {
      INVALID_ENCODING_UTF8_DOT: "文字コードが正しくありません。UTF-8で保存し直してください。",
      DISALLOWED_HEADER: (header: string) =>
        `許可されていないヘッダー「${header}」があります。テンプレートCSVのヘッダーを使用してください。`,
      DUPLICATE_HEADER: (label: string, prevCol: number, nextCol: number) =>
        `${label}列が重複しています（${prevCol}列目と${nextCol}列目）。ヘッダーを修正してください。`,
      REQUIRED_HEADER_NOT_FOUND: (label: string) => `${label}列が見つかりません。ヘッダー名を確認してください。`,
      REQUIRED: (label: string) => `${label}は必須です。`,
      MAX_LENGTH: (label: string, max: number) => `${label}は${max}文字以内で入力してください。`,
      GENDER_MUST_BE_ALLOWED: "性別は『男性/女性/その他』で入力してください。",
      DATE_NOT_RECOGNIZED_WITH_EXAMPLE: (label: string, example: string) =>
        `${label}が日付として認識できません。例: ${example}`,
      DEPARTMENT_NOT_IN_MASTER_ADDABLE: "部署がマスタに存在しません。追加して取り込みできます。",
      WORK_LOCATION_NOT_IN_MASTER_ADDABLE: "稼働先がマスタに存在しません。追加して取り込みできます。",
      WORK_STATUS_NOT_IN_MASTER: (workStatus: string) =>
        `稼働状態「${workStatus}」がマスタに存在しません。CSVの稼働状態を修正してください。`,
      RETIREMENT_DATE_BEFORE_JOIN_DATE: "退職日が入社日より前になっています。日付を修正してください。",
      RETIREMENT_DATE_IN_FUTURE: "退職日が未来日です。修正してください。",
      EMPLOYEE_ID_DUPLICATED_IN_CSV: "社員IDがCSV内で重複しています。重複行を修正してください。",
    },
  },

  PROFILE: {
    IMAGE_FILE_REQUIRED: "画像ファイル（PNG/JPG など）を選択してください",
    IMAGE_TOO_LARGE: "画像サイズが大きすぎます（2MB以下）",
  },
} as const;

export const NOTIFY_MESSAGES = {
  SYSTEM: {
    CONFIRM_DISCARD_CHANGES: "変更を破棄して戻りますか？",
  },
  AUTH: {
    PASSWORD_RESET_EMAIL_SENT: "再設定メールを送信しました。メールをご確認ください。",
    PASSWORD_UPDATED: "パスワードを変更しました。ログイン画面からログインしてください。",
  },
  SYSTEM_USERS: {
    UPDATED: "アカウントを更新しました",
    DELETED: "アカウントを削除しました",
    CONFIRM_DELETE: "このアカウントを削除しますか？",
    INVITE_COPIED: "招待情報をコピーしました。",
    COPY_FAILED: "コピーに失敗しました。手動でコピーしてください。",
  },
} as const;
