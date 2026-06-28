-- 既存のテーブルを一度削除して再作成する設計（開発環境向け）
DROP TABLE IF EXISTS weight_entries;

CREATE TABLE weight_entries (
    date DATE NOT NULL,
    weight FLOAT NOT NULL,
    -- 日付をユニークキーに設定することで、同じ日付の重複登録を防ぎます
    UNIQUE KEY (date)
);