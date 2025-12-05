FROM maven:3.8.8-eclipse-temurin-17 AS build
WORKDIR /app
# 不使用项目根的 mvnw（wrapper）文件，maven 镜像自带 mvn
# 只拷贝 pom.xml 和源码目录
COPY backend/pom.xml .
COPY backend/src ./src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/smart-telecom-backend-0.1.0.jar app.jar
# 复制推理规则文件到容器
COPY ontology/transfer-process-rules.rules /app/ontology/transfer-process-rules.rules
EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]
