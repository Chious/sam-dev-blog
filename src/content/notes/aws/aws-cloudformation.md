---
title: 【DVA-C02】AWS CloudFormation
date: 2025-07-26
tags: ["AWS", "CloudFormation"]
description: "AWS CloudFormation 簡介"
---

## 一、什麼是 AWS CloudFormation？

> AWS CloudFormation 是一個服務，可以讓你使用程式碼來管理你的 AWS 資源。

## 二、使用 template 來建立 stack

> [AWS resource and property types reference](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/aws-template-resource-type-ref.html)

例如：

```yaml
Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c55b159cbfafe1f0
      InstanceType: t2.micro
      KeyName: my-key-pair
      SecurityGroups:
        - my-security-group
```

### 參數設定

params vs map
特定的參數 vs 有一系列的映射

- **Properties** 是 AWS 資源的屬性，例如：ImageId、InstanceType、KeyName、SecurityGroups
  - 如果需要重複使用的話，可以將屬性放在 `Fn::Ref` 中
  - Parameter 支援：字串、數字、布林值、列表、映射、Regex ... 等

```yaml
Parameters:
  MyStringParameter:
    Type: String
    Default: my-string-parameter

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !Ref MyStringParameter
      InstanceType: t2.micro
      KeyName: my-key-pair
```

- Mapping

```yaml
RegionMap:
  us-east-1:
    HVM64: ami-0c55b159cbfafe1f0
    HVMG2: ami-0c55b159cbfafe1f0
  us-west-1:
    HVM64: ami-0c55b159cbfafe1f0
    HVMG2: ami-0c55b159cbfafe1f0

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", HVM64]
      InstanceType: t2.micro
```

`!FindInMap [RegionMap, !Ref "AWS::Region", HVM64]`

> 指的是：
>
> 1. 取得當前部署 AWS 的區域（如：us-east-1）
> 2. 從 RegionMap 中找到對應的值
> 3. 從對應的值中找到 HVM64 的值
> 4. 將 HVM64 的值設定為 ImageId

### 參數 3: Output

> Output 是 CloudFormation 的輸出，可以讓你將 stack 的輸出值傳遞給其他 stack

```yaml
Resources:
  MySecureInstance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-0c55b159cbfafe1f0
      InstanceType: t2.micro
      KeyName: my-key-pair
      SecurityGroups:
        - !ImportValue SSHSecurityGroup

Outputs:
  SSHSecurityGroup:
    Description: The security group for the SSH connection
    Value: !Ref MySecureInstance
    Export:
      Name: SSHSecurityGroup
```

### 參數 4: Condition

- 開發環境(Dev) vs 正式環境(Prod)
- 區域(Region)

```yaml
Conditions:
  CreateProdResources: !Equals [!Ref Environment, prod]
  CreateDevResources: !Equals [!Ref Environment, dev]

Resources:
  MountPoint:
    Type: AWS::EC2::VolumeAttachment
    Condition: CreateProdResources
```

### 參數 5: 內建函數(Intrinsic Functions)說明與範例

#### 1. Ref - 參考函數

**說明**: 用來引用參數、資源的實體 ID 或其他屬性值
**用途**: 最常用的函數，可以引用參數值或資源的主要識別符

```yaml
Parameters:
  InstanceType:
    Type: String
    Default: t2.micro

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !Ref InstanceType # 引用參數值

  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      VpcId: !Ref MyVPC # 引用 VPC 資源的 ID
```

#### 2. Fn::GetAtt - 取得屬性函數

**說明**: 獲取資源的特定屬性值（非主要 ID）
**用途**: 當需要資源的特定屬性時使用，如 DNS 名稱、ARN 等

```yaml
Resources:
  EC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: t2.micro
      ImageId: ami-12345678

  EBSVolume:
    Type: AWS::EC2::Volume
    Properties:
      Size: 100
      AvailabilityZone: !GetAtt EC2Instance.AvailabilityZone # 取得 EC2 的可用區域

  LoadBalancer:
    Type: AWS::ElasticLoadBalancing::LoadBalancer
    Properties:
      # ... 其他設定

Outputs:
  LoadBalancerDNS:
    Value: !GetAtt LoadBalancer.DNSName # 輸出負載均衡器的 DNS 名稱
```

#### 3. Fn::FindInMap - 映射查找函數

**說明**: 從映射表中根據鍵值查找對應的值
**用途**: 用於根據不同條件（如區域、環境）選擇不同的值

```yaml
Mappings:
  RegionMap:
    us-east-1:
      HVM64: ami-0c55b159cbfafe1f0
      HVMG2: ami-0a634ae95e11c6f91
    us-west-1:
      HVM64: ami-0bdb828fd58c52235
      HVMG2: ami-066ee5fd4a9ef77f1
    ap-southeast-1:
      HVM64: ami-08569b978cc4dfa10
      HVMG2: ami-0be9df32ae9f92309

Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: !FindInMap [RegionMap, !Ref "AWS::Region", HVM64] # 根據當前區域選擇 AMI
      InstanceType: t2.micro
```

#### 4. Fn::ImportValue - 匯入值函數

**說明**: 匯入其他 CloudFormation Stack 匯出的值
**用途**: 用於跨 Stack 共享資源或值

```yaml
# Stack A (基礎設施 Stack) - 匯出 VPC ID
Resources:
  MyVPC:
    Type: AWS::EC2::VPC
    Properties:
      CidrBlock: 10.0.0.0/16

Outputs:
  VPCId:
    Description: VPC ID for other stacks
    Value: !Ref MyVPC
    Export:
      Name: MyProject-VPC-ID

---
# Stack B (應用程式 Stack) - 匯入 VPC ID
Resources:
  MySecurityGroup:
    Type: AWS::EC2::SecurityGroup
    Properties:
      GroupDescription: Security group for my application
      VpcId: !ImportValue MyProject-VPC-ID # 匯入其他 Stack 的 VPC ID
```

#### 5. Fn::Base64 - Base64 編碼函數

**說明**: 將字串編碼為 Base64 格式
**用途**: 主要用於 EC2 UserData，因為 AWS 要求 UserData 必須是 Base64 編碼

```yaml
Resources:
  MyEC2Instance:
    Type: AWS::EC2::Instance
    Properties:
      ImageId: ami-12345678
      InstanceType: t2.micro
      UserData:
        Fn::Base64: !Sub |
          #!/bin/bash
          yum update -y
          yum install -y httpd
          systemctl start httpd
          systemctl enable httpd
          echo "<h1>Hello from ${AWS::Region}</h1>" > /var/www/html/index.html
```

#### 6. 條件函數 (Condition Functions)

**說明**: 用於條件判斷和邏輯運算
**用途**: 根據不同條件創建或配置資源

### Fn::If - 條件判斷

```yaml
Parameters:
  CreateProdResources:
    Type: String
    Default: "false"
    AllowedValues: ["true", "false"]

Conditions:
  IsProd: !Equals [!Ref CreateProdResources, "true"]

Resources:
  # 只在生產環境創建大型實例
  MyInstance:
    Type: AWS::EC2::Instance
    Properties:
      InstanceType: !If [IsProd, m5.large, t2.micro] # 條件選擇實例類型
      ImageId: ami-12345678

  # 只在生產環境創建此資源
  ProdOnlyResource:
    Type: AWS::S3::Bucket
    Condition: IsProd # 只有滿足條件才創建
```

#### Fn::Not, Fn::And, Fn::Or - 邏輯運算

```yaml
Parameters:
  Environment:
    Type: String
    Default: dev
    AllowedValues: [dev, staging, prod]

  EnableBackup:
    Type: String
    Default: "false"
    AllowedValues: ["true", "false"]

Conditions:
  IsProd: !Equals [!Ref Environment, prod]
  IsStaging: !Equals [!Ref Environment, staging]
  IsProdOrStaging: !Or [!Ref IsProd, !Ref IsStaging] # 生產或測試環境
  IsNotDev: !Not [!Equals [!Ref Environment, dev]] # 非開發環境
  NeedBackup: !And [!Ref IsNotDev, !Equals [!Ref EnableBackup, "true"]] # 非開發且啟用備份

Resources:
  MyDatabase:
    Type: AWS::RDS::DBInstance
    Properties:
      DBInstanceClass: !If [IsProd, db.t3.medium, db.t3.micro]
      BackupRetentionPeriod: !If [NeedBackup, 7, 0] # 根據條件設定備份天數
```

## 三、回滾機制（Rollback）

> 當 stack 建立失敗時，CloudFormation 會自動回滾到上次成功的狀態

## 四、IAM Role 設定

> 透過 Permission 來設定誰能夠存取 CloudFormation 資源
