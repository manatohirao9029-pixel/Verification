from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from pydantic import BaseModel  
import mysql.connector

class WeightEntry(BaseModel):
    date: str
    weight: float

# データベース接続の共通処理を切り出す
class DatabaseHandler:
    def __init__(self, db_config):
        self.db_config = db_config

    def get_connection(self):
        return mysql.connector.connect(**self.db_config)

# 読み込み専用クラス
class WeightReader(DatabaseHandler):
    def fetch_all(self):
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM weight_entries")
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data
    
    # 期間指定で取得（グラフ用に必要）
    def fetch_by_range(self, start_date: str, end_date: str):
        conn = self.get_connection()
        cursor = conn.cursor(dictionary=True)
        # SQLで日付フィルタリングを行うのが鉄則です
        cursor.execute("SELECT * FROM weight_entries WHERE date BETWEEN %s AND %s ORDER BY date ASC", 
                       (start_date, end_date))
        data = cursor.fetchall()
        cursor.close()
        conn.close()
        return data

# 書き込み専用クラス
class WeightWriter(DatabaseHandler):
    def insert(self, entry):
        conn = self.get_connection()
        cursor = conn.cursor()
        
        # 修正箇所: SQL文をUPSERT対応に変更
        sql = """
        INSERT INTO weight_entries (date, weight) 
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE weight = VALUES(weight)
        """
        
        try:
            cursor.execute(sql, (entry.date, entry.weight))
            conn.commit()
        except Exception as e:
            print(f"Error: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()

config = {
    'user': 'user',
    'password': 'userpass',
    'host': '127.0.0.1',
    'database': 'personal_db'
}

app = FastAPI()
reader = WeightReader(config)
writer = WeightWriter(config)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/getweight")
def get_weights():
    # DBから取得したリストをそのまま返す
    return reader.fetch_all()

@app.post("/api/insertweight")
def insert_weight(entry: WeightEntry):
    writer.insert(entry)
    return {"message": f"Success: {entry.date} - {entry.weight}kg"}

@app.get("/api/getweight/range")
def get_weights_by_range(start_date: str, end_date: str):
    return reader.fetch_by_range(start_date, end_date)