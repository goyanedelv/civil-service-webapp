# civil-service-webapp
Big Data Application Architecture, Final Project. Data used in this project is not real.

## Process

First, I created the database in hive
```sql
hive> CREATE TABLE gov_electoral_data (X int, Cedula int, Circunscripcion string, Comuna string, DV int, Edad int, Nacionalidad string, Pais_Domicilio string, Pais_Nacimiento string, Partido string, Provincia string, Rando_Edad string, Region string, Sexo string, VotoExterior string, Numero_de_registros int, Votaron int, unique_id int, full_name int, digest string, Mesa int, Locale int) row format delimited fields terminated by ',';
```

Then, after deploying the database to the server, I copied the data from the `.csv` file into Hive.
```sql
hive> LOAD DATA LOCAL INPATH '/home/hadoop/gov/civil_service_data/data/enriched_electoral_data.csv' OVERWRITE INTO TABLE gov_electoral_data;
```
```sql
hive> describe gov_electoral_data;
+----------------------+------------+----------+
|       col_name       | data_type  | comment  |
+----------------------+------------+----------+
| x                    | int        |          |
| cedula               | int        |          |
| circunscripcion      | string     |          |
| comuna               | string     |          |
| dv                   | int        |          |
| edad                 | int        |          |
| nacionalidad         | string     |          |
| pais_domicilio       | string     |          |
| pais_nacimiento      | string     |          |
| partido              | string     |          |
| provincia            | string     |          |
| rando_edad           | string     |          |
| region               | string     |          |
| sexo                 | string     |          |
| votoexterior         | string     |          |
| numero_de_registros  | int        |          |
| votaron              | int        |          |
| unique_id            | int        |          |
| full_name            | int        |          |
| digest               | string     |          |
| mesa                 | int        |          |
| locale               | int        |          |
+----------------------+------------+----------+
```
