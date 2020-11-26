# Point cloud data analysis using quadtree
## Introduction
This is a master project in civil engineering with supporting from computer engineering field.  
The target is to get the structure of a construction from point cloud scanned by a Terrestrial Laser Scanning TLS device in order for 3D rendering.  

## Algorithm
Input: set of point cloud in 2D  
Processing:  
- Construct a quad tree of these points  
- Retrieve all nodes in the quadtree which are inside the construction  
- Determine nodes that are edge nodes from insdide nodes  
- Get all points of edge nodes then filter them by deviation angles of their k nearest neighbors  
- Split the plane that contains filtered points into small regions. Find the linear regression line of each region by least squares method then adjust them to be a connecting line  
- ...