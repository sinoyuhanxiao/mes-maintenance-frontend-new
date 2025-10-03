import{h as i,E as s}from"../../assets/index-CE-d1vf_.js";const t=s.USER_CLIENT_URL,c=(e=1,n=1e3,a="username",o="ASC")=>i.request({url:"/user",baseURL:t,method:"get",data:{page:e,size:n,sortField:a,direction:o}}),p=(e={},n=1,a=10,o="createdAt",r="DESC")=>i.request({method:"post",url:"/user/search",baseURL:t,data:e,params:{page:n,size:a,sortField:o,direction:r}}),u=e=>i.request({method:"get",url:`/user/${e}`,baseURL:t}),g=e=>i.request({method:"post",url:"/user",baseURL:t,data:e}),m=(e,n)=>i.request({method:"patch",url:`/user/admin/${e}`,baseURL:t,data:n}),l=async()=>Promise.resolve([{id:1,name:"Production Line Operator",description:`Operating machinery and equipment along the production line.
        Monitoring the production process and ensuring it meets quality standards.
        Adjusting machine settings for different product batches.
        Performing basic troubleshooting and maintenance of equipment.`},{id:2,name:"Quality Control Inspector",description:`Inspecting products for quality and compliance with food safety regulations.
        Conducting visual and sensory inspections at different stages of production.
        Testing samples for proper weight, packaging integrity, and other specifications.
        Documenting inspection results and reporting defects to supervisors.`},{id:3,name:"Sanitation Worker",description:`Cleaning and sanitizing equipment, production areas, and storage facilities.
        Ensuring compliance with sanitation standards to avoid contamination.
        Properly handling chemicals and maintaining cleaning equipment.
        Documenting sanitation processes and maintaining logs.`},{id:4,name:"Production Supervisor",description:`Overseeing the production line to ensure targets and deadlines are met.
        Managing the production team, assigning tasks, and ensuring smooth workflow.
        Monitoring production efficiency and resolving operational issues.
        Coordinating with quality assurance and maintenance teams.`},{id:5,name:"Maintenance Technician",description:`Performing routine maintenance and repairs on production equipment.
        Troubleshooting and resolving equipment breakdowns to minimize downtime.
        Ensuring machines are calibrated correctly for different production runs.
        Keeping records of maintenance activities and scheduling preventive maintenance.`},{id:6,name:"Packaging Operator",description:`Operating packaging machines to pack products into containers or boxes.
        Ensuring proper labeling, sealing, and packaging quality.
        Monitoring packaging equipment for any issues and troubleshooting as needed.
        Reporting packaging defects and ensuring the production line stays stocked with materials.`},{id:7,name:"Food Safety Manager",description:`Ensuring that food production processes comply with food safety regulations (e.g., HACCP, FDA).
        Conducting audits and implementing food safety protocols across the facility.
        Training staff on food safety procedures and best practices.
        Investigating any food safety issues or product recalls and implementing corrective actions.`},{id:8,name:"Inventory Coordinator",description:`Managing raw material and product inventory levels to avoid shortages or overstock.
        Coordinating with suppliers and production teams to ensure materials are available.
        Tracking inventory movement in the warehouse and updating inventory systems.
        Conducting physical inventory counts and reconciling discrepancies.`},{id:9,name:"Production Planner",description:`Creating and managing production schedules to meet customer orders and deadlines.
        Coordinating with the procurement, inventory, and production teams to ensure material availability.
        Adjusting schedules based on production capacity, machine availability, and workforce.
        Monitoring production performance and identifying areas for process improvement.`},{id:10,name:"Warehouse Manager",description:`Overseeing the storage and distribution of raw materials and finished products.
        Managing warehouse staff and ensuring efficient stock rotation and inventory accuracy.
        Coordinating with logistics and production teams to ensure timely shipments.
        Implementing safety protocols for warehouse operations and equipment.`},{id:11,name:"Production Line Worker",description:`Assisting in various stages of the production process (e.g., ingredient preparation, sorting, etc.).
        Operating machinery and following standard operating procedures (SOPs).
        Ensuring that the production area is clean and safe.
        Packing products and preparing them for the next step in the process.`},{id:12,name:"ADMIN",description:"Administrator",el_tag_type:"danger"},{id:13,name:"USER",description:"Role user"},{id:14,name:"MANAGER",description:"Role manager"},{id:15,name:"TEMP_USER",description:"Role temp user"},{id:16,name:"Maintenance Worker",description:"Maintenance Worker"}]),h=async()=>Promise.resolve([{id:1,name:"Maintenance",el_tag_type:"success"},{id:2,name:"Quality Control",el_tag_type:"primary"},{id:3,name:"Production",el_tag_type:"danger"}]);export{h as a,c as b,u as c,g as d,l as g,p as s,m as u};
