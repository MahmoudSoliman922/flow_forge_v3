import React, { useEffect, useState } from 'react';                                       
 import { useParams, useNavigate } from 'react-router-dom';                                
 import { useFlows } from '../contexts/FlowContext';                                       
 import FlowEditor from './FlowEditor';                                                    
                                                                                           
 const ForkFlow: React.FC = () => {                                                        
   const { flowId, version } = useParams<{ flowId: string; version: string }>();           
   const { liveFlows, addTempFlow } = useFlows();                                          
   const navigate = useNavigate();                                                         
   const [flowData, setFlowData] = useState<any>(null);                                    
   const [isLoading, setIsLoading] = useState(true);                                       
   const [error, setError] = useState<string | null>(null);                                
                                                                                           
   useEffect(() => {                                                                       
     const forkFlow = async () => {                                                        
       setIsLoading(true);                                                                 
       setError(null);                                                                     
       try {                                                                               
         const flow = liveFlows.find(f => f.id === Number(flowId));                        
         if (flow) {                                                                       
           const versionData = flow.versions.find(v => v.metadata.version === version);    
           if (versionData) {                                                              
             const forkedFlow = {                                                          
               ...versionData,                                                             
               id: Date.now(), // Generate a new ID for the forked flow                    
               metadata: {                                                                 
                 ...versionData.metadata,                                                  
                 title: `Fork of ${versionData.metadata.title}`,                           
                 version: '1.0.0', // Reset version for the new fork                       
               },                                                                          
             };                                                                            
             await addTempFlow(forkedFlow);                                                
             setFlowData(forkedFlow);                                                      
             navigate(`/flows/${forkedFlow.id}`); // Redirect to the edit fork flow page   
           } else {                                                                        
             throw new Error('Version not found');                                         
           }                                                                               
         } else {                                                                          
           throw new Error('Flow not found');                                              
         }                                                                                 
       } catch (err) {                                                                     
         setError(err instanceof Error ? err.message : 'An error occurred while forking th flow');                                                                                   
         console.error(err);                                                               
       } finally {                                                                         
         setIsLoading(false);                                                              
       }                                                                                   
     };                                                                                    
                                                                                           
     forkFlow();                                                                           
   }, [flowId, version, liveFlows, addTempFlow, navigate]);                                
                                                                                           
   if (isLoading) {                                                                        
     return <div>Loading...</div>;                                                         
   }                                                                                       
                                                                                           
   if (error) {                                                                            
     return <div>Error: {error}</div>;                                                     
   }                                                                                       
                                                                                           
   if (!flowData) {                                                                        
     return <div>No flow data available</div>;                                             
   }                                                                                       
                                                                                           
   return <FlowEditor />;                                                                  
 };                                                                                        
                                                                                           
 export default ForkFlow; 