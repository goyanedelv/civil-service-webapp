# civil-service-webapp
Big Data Application Architecture, Final Project. Data used in this project is not real.

## Process

First, we create the database in hive
```sql
hive> CREATE TABLE gov_electoral_data (X STRING, Circunscripcion STRING, Edad INT, Nacionalidad STRING, Partido STRING, Provincia STRING, Region STRING, Sexo STRING, Sufragio STRING, VotoExterior STRING, Numero_de_registros INT, Votaron INT, unique_id INT, full_name STRING, digest STRING, Mesa INT, Locale INT) row format delimited fields terminated by ',';
```

Then, after deploying the database to the server, we copy the data from the `.csv` file into Hive.
```sql
hive> LOAD DATA LOCAL INPATH '/home/hadoop/gov/civil_service_data/data/enriched_electoral_data_simplified.csv' OVERWRITE INTO TABLE gov_electoral_data;
```

```sql
hive> create table gov_electoral_data_2 as select unique_id, X, Circunscripcion, Edad, Nacionalidad, Partido, Provincia, Region, Sexo, Sufragio, VotoExterior, Numero_de_registros, Votaron, full_name, digest, Mesa, Locale from gov_electoral_data where unique_id is not null
```




```sql
hive> describe gov_electoral_data;
```

```sql
hbase> create 'gov_electoral_data', 'elect'

hive> 
create external table gov_electoral_data_hbase 
    (unique_id BIGINT, x STRING, circunscripcion STRING, edad BIGINT, nacionalidad STRING, partido STRING, provincia STRING, region STRING, sexo STRING, sufragio STRING, votoexterior STRING, numero_de_registros BIGINT, votaron BIGINT, full_name STRING, digest STRING, mesa BIGINT, locale BIGINT)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES ('hbase.columns.mapping' = ':key,elect:x,elect:circunscripcion,elect:edad,elect:nacionalidad,elect:partido,elect:provincia,elect:region,elect:sexo,elect:sufragio,elect:votoexterior,elect:numero_de_registros,elect:votaron,elect:full_name,elect:digest,elect:mesa,elect:locale')
TBLPROPERTIES ('hbase.table.name' = 'gov_electoral_data');

hive> insert overwrite table gov_electoral_data_hbase select * from gov_electoral_data_2;
```
We can verify our database is in hbase by running:
```shell
hbase> scan 'gov_electoral_data'
```
Then, we upload the web application to the webserver, all `html`, `mustache` and `js` files. In a SSH connection to the webserver, under the application folder, we run:
```shell
node app.js 3007 172.31.39.49 8070
```