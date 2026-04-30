import pandas as pd
import psycopg2
import os
print("FILES FOUND:", os.listdir("data"))

# DB CONNECTION
conn = psycopg2.connect(
    "postgresql://neondb_owner:npg_QqdbR2EKAw1H@ep-bold-bonus-an2prq1w-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
)
cur = conn.cursor()

DATA_FOLDER = "data"

# Insert India
cur.execute("INSERT INTO country (name) VALUES ('India') ON CONFLICT DO NOTHING;")
conn.commit()

cur.execute("SELECT id FROM country WHERE name='India'")
country_id = cur.fetchone()[0]

state_map = {}
district_map = {}
subdistrict_map = {}

for file in os.listdir(DATA_FOLDER):
    if file.endswith((".xls", ".xlsx", ".ods")):
        path = os.path.join(DATA_FOLDER, file)
        print("Processing:", file)

        try:
            df = pd.read_excel(path, skiprows=1)
            df.columns = df.columns.str.strip()
        except:
            print("Error reading:", file)
            continue

        # Skip bad file (MP issue)
        if "Unnamed" in str(df.columns[0]):
            print("Skipping bad file:", file)
            continue

        print("Columns:", df.columns)

        for _, row in df.iterrows():
            state = str(row.get("STATE NAME", "")).strip()
            district = str(row.get("DISTRICT NAME", "")).strip()
            subdistrict = str(row.get("SUB-DISTRICT NAME", "")).strip()
            village = str(row.get("Area Name", "")).strip()

            if not state or not district or not subdistrict or not village:
                continue

            # STATE
            if state not in state_map:
                cur.execute(
                    "INSERT INTO state (name, country_id) VALUES (%s, %s) RETURNING id",
                    (state, country_id)
                )
                state_map[state] = cur.fetchone()[0]

            # DISTRICT
            key_d = (district, state)
            if key_d not in district_map:
                cur.execute(
                    "INSERT INTO district (name, state_id) VALUES (%s, %s) RETURNING id",
                    (district, state_map[state])
                )
                district_map[key_d] = cur.fetchone()[0]

            # SUBDISTRICT
            key_s = (subdistrict, district)
            if key_s not in subdistrict_map:
                cur.execute(
                    "INSERT INTO subdistrict (name, district_id) VALUES (%s, %s) RETURNING id",
                    (subdistrict, district_map[key_d])
                )
                subdistrict_map[key_s] = cur.fetchone()[0]

            # VILLAGE
            cur.execute(
                "INSERT INTO village (name, subdistrict_id) VALUES (%s, %s)",
                (village, subdistrict_map[key_s])
            )

        conn.commit()

cur.close()
conn.close()

print(" DATA IMPORT COMPLETED")