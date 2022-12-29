import json
from datetime import datetime, timezone

example = [
      {
        "date": 1667260800,
        "recommendations_up": 20,
        "recommendations_down": 2
      },
      {
        "date": 1667347200,
        "recommendations_up": 21,
        "recommendations_down": 0
      },
      {
        "date": 1667433600,
        "recommendations_up": 27,
        "recommendations_down": 3
      },
      {
        "date": 1667520000,
        "recommendations_up": 19,
        "recommendations_down": 1
      },
      {
        "date": 1667606400,
        "recommendations_up": 23,
        "recommendations_down": 0
      },
      {
        "date": 1667692800,
        "recommendations_up": 32,
        "recommendations_down": 1
      },
      {
        "date": 1667779200,
        "recommendations_up": 24,
        "recommendations_down": 2
      },
      {
        "date": 1667865600,
        "recommendations_up": 20,
        "recommendations_down": 2
      },
      {
        "date": 1667952000,
        "recommendations_up": 18,
        "recommendations_down": 0
      },
      {
        "date": 1668038400,
        "recommendations_up": 20,
        "recommendations_down": 0
      },
      {
        "date": 1668124800,
        "recommendations_up": 27,
        "recommendations_down": 2
      },
      {
        "date": 1668211200,
        "recommendations_up": 32,
        "recommendations_down": 1
      },
      {
        "date": 1668297600,
        "recommendations_up": 29,
        "recommendations_down": 0
      },
      {
        "date": 1668384000,
        "recommendations_up": 34,
        "recommendations_down": 1
      },
      {
        "date": 1668470400,
        "recommendations_up": 27,
        "recommendations_down": 2
      },
      {
        "date": 1668556800,
        "recommendations_up": 30,
        "recommendations_down": 0
      },
      {
        "date": 1668643200,
        "recommendations_up": 21,
        "recommendations_down": 1
      },
      {
        "date": 1668729600,
        "recommendations_up": 28,
        "recommendations_down": 0
      },
      {
        "date": 1668816000,
        "recommendations_up": 32,
        "recommendations_down": 2
      },
      {
        "date": 1668902400,
        "recommendations_up": 27,
        "recommendations_down": 3
      },
      {
        "date": 1668988800,
        "recommendations_up": 28,
        "recommendations_down": 3
      },
      {
        "date": 1669075200,
        "recommendations_up": 462,
        "recommendations_down": 8
      },
      {
        "date": 1669161600,
        "recommendations_up": 903,
        "recommendations_down": 10
      },
      {
        "date": 1669248000,
        "recommendations_up": 569,
        "recommendations_down": 7
      },
      {
        "date": 1669334400,
        "recommendations_up": 405,
        "recommendations_down": 4
      },
      {
        "date": 1669420800,
        "recommendations_up": 415,
        "recommendations_down": 6
      },
      {
        "date": 1669507200,
        "recommendations_up": 371,
        "recommendations_down": 6
      },
      {
        "date": 1669593600,
        "recommendations_up": 279,
        "recommendations_down": 6
      },
      {
        "date": 1669680000,
        "recommendations_up": 210,
        "recommendations_down": 3
      },
      {
        "date": 1669766400,
        "recommendations_up": 22,
        "recommendations_down": 1
      }
    ]
for entry in example:
    entry["date"] = datetime.fromtimestamp(entry["date"]).replace(tzinfo=timezone.utc)
    # print(entry["date"])


for file_counter in range(56):
    with open(f"achievements_and_likes/tmp_{file_counter*1000}-{(file_counter+1)*1000 - 1}.json") as fl:
        processed_data = json.load(fl)
    for entry in processed_data:
        entry["fixed_date"] = []

        j = 0
        for i in range(len(example)):
            dt = datetime.now().replace(tzinfo=timezone.utc)
            if len(entry["histogram"])>i:
              dt = datetime.fromtimestamp(entry["histogram"][i]["date"]).replace(tzinfo=timezone.utc)
            while j< len(example):
                if (dt-example[j]["date"]).total_seconds() < 23*60*60:
                    entry["histogram"][i]["date"] = int((example[j]["date"]-datetime(1970,1,1).replace(tzinfo=timezone.utc)).total_seconds())
                    j+=1
                    entry["fixed_date"].append(entry["histogram"][i])
                    break
                else:
                    entry["fixed_date"].append({
                        "date": int((example[j]["date"]-datetime(1970,1,1).replace(tzinfo=timezone.utc)).total_seconds()),
                        "recommendations_up": 0,
                        "recommendations_down": 0
                    })
                    j+=1
        
        if(len(entry["fixed_date"])<30 or len(entry["fixed_date"])>31):
          print(entry["histogram"])
          print(entry["pid"])
          exit()
        del entry["histogram"]
        # print(entry["fixed_date"])
        # exit()
    with open(f"normalised_likes/tmp_{file_counter*100}-{(file_counter+1)*1000 - 1}.json", "w") as output_file:
        json.dump(processed_data, output_file, indent=2)

    
