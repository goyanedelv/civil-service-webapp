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

## For the second table

```sql
hive> CREATE TABLE gov_circunscripcion_enrichment (Circunscripcion STRING, poverty_income FLOAT, poverty_multi FLOAT, vulnerability STRING) row format delimited fields terminated by ';';
hive> LOAD DATA LOCAL INPATH '/home/hadoop/gov/civil_service_data/data/circuns_2.csv' OVERWRITE INTO TABLE gov_circunscripcion_enrichment;
hive> create table gov_circunscripcion_enrichment_2 as (select * from gov_circunscripcion_enrichment where poverty_income is not null);
```

Then, in scala we run:

```scala
scala> val gov_electoral_data = spark.table("gov_electoral_data")
scala> val gov_circuns_data = spark.table("gov_circunscripcion_enrichment_2")
scala> val gov_enriched = gov_electoral_data /*I had an intermediate step that removed*/
scala> gov_enriched.columns.toSeq

/* Electoral info*/
scala> val gov_enriched_grouped = gov_enriched.groupBy(gov_enriched("circunscripcion")).agg(sum("votaron").as("voted"), count("full_name").as("voters"))
scala> gov_enriched_grouped.show

/* Vulnerability info */
scala> val gov_enriched_grouped_2 = gov_enriched_grouped.withColumn("circunscripcion_2", expr("substring(circunscripcion, 2, length(circunscripcion)-2)"))
scala> val gov_enriched_grouped_vul = gov_enriched_grouped_2.join(gov_circuns_data, gov_enriched_grouped_2("circunscripcion_2") <=> gov_circuns_data("circunscripcion"), "left").drop(gov_circuns_data("circunscripcion"))
scala> gov_enriched_grouped_vul.show

/* Saving to hive*/
scala> import org.apache.spark.sql.SaveMode
scala> gov_enriched_grouped_vul.write.mode(SaveMode.Overwrite).saveAsTable("gov_electoral_stats")
```

Then moving data to hbase through hive.

```sql
hbase> create 'gov_electoral_stats', 'stat'
hive> 
create table gov_electoral_stats_2 as select circunscripcion_2, voters, voted, poverty_income, poverty_multi, vulnerability from gov_electoral_stats;
hive> drop table gov_electoral_stats;
hive> create table gov_electoral_stats as select * from gov_electoral_stats_2;
hive> create external table gov_electoral_stats_hbase 
    (circunscripcion STRING, voted BIGINT, voters  BIGINT, poverty_income FLOAT, poverty_multi FLOAT, vulnerability STRING)
STORED BY 'org.apache.hadoop.hive.hbase.HBaseStorageHandler'
WITH SERDEPROPERTIES ('hbase.columns.mapping' = ':key,stat:voted,stat:voters,stat:poverty_income,stat:poverty_multi,stat:vulnerability')
TBLPROPERTIES ('hbase.table.name' = 'gov_electoral_stats');

hive> insert overwrite table gov_electoral_stats_hbase select * from gov_electoral_stats;
```

Now, we deploy the application using CodeDeploy and a classic load balancer in AWS.