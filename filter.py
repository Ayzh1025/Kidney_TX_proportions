import pandas as pd

# Load CSV once
df = pd.read_csv("/Users/amy/Downloads/Waitinglist(in).csv")

def filter_data(df, **filters):
    """
    Filters dataframe based on keyword arguments.
    Example: filter_data(df, AGE=40, GENDER='F')
    """
    filtered = df.copy()
    
    for col, val in filters.items():
        if val is None:  # Skip filters where user passed "any"
            continue
        if isinstance(val, list):  # e.g. multiple values
            filtered = filtered[filtered[col].isin(val)]
        else:
            filtered = filtered[filtered[col] == val]

    return filtered.shape[0]

filters = {
    "INIT_AGE": 40,
    "GENDER": "F"
}
res = filter_data(df, **filters)
print(res)